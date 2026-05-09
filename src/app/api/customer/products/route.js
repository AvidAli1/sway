import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';
import Brand from '@/app/models/brandModel';

import Customer from '@/app/models/customerModel';
import { authMiddleware } from '@/utils/authMiddleware';
import { getTextEmbedding } from '@/utils/recommendationService';

// GET /api/customer/products - Get products for customers with infinite scroll
export async function GET(request) {
  try {
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12; // Grid layout default
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const gender = searchParams.get('gender');
    const minPrice = parseFloat(searchParams.get('minPrice'));
    const maxPrice = parseFloat(searchParams.get('maxPrice'));
    const brand = searchParams.get('brand');
    const colorsParam = searchParams.get('colors');
    const seasonParam = searchParams.get('season');
    const search = searchParams.get('search');
    const ratingParam = searchParams.get('rating');
    const rating = ratingParam ? parseFloat(ratingParam) : null;
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, price, name, popularity
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc
    const featured = searchParams.get('featured') === 'true';

    // Helper for Season
    function getSeason(date = new Date()) {
      const month = date.getMonth();
      if (month === 11 || month <= 1) return 'Winter';
      if (month >= 2 && month <= 4) return 'Spring';
      if (month >= 5 && month <= 7) return 'Summer';
      return 'Autumn';
    }
    const currentSeason = getSeason();

    const seasonsArr = ['Winter', 'Spring', 'Summer', 'Autumn'];
    const currentIdx = seasonsArr.indexOf(currentSeason) !== -1 ? seasonsArr.indexOf(currentSeason) : 0;
    const seasonPriority = [currentSeason, 'All Seasons'];
    for (let i = 1; i < 4; i++) {
      seasonPriority.push(seasonsArr[(currentIdx + i) % 4]);
    }

    // Build query - only show active products
    // Layer 1: Stock (applied to ALL queries)
    const query = {
      status: 'active',
      inStock: true
    };

    // Add filters
    if (category) {
      const categories = category.split(',');
      if (categories.length > 1) {
        query.category = { $in: categories };
      } else {
        query.category = category;
      }
    }

    if (subCategory) {
      const subCategories = subCategory.split(',');
      if (subCategories.length > 1) {
        query.subCategory = { $in: subCategories };
      } else {
        query.subCategory = subCategory;
      }
    }

    if (gender && gender !== 'all') {
      query.gender = { $in: [gender, 'unisex'] };
    }

    if (minPrice !== null && !isNaN(minPrice)) {
      query.price = { ...query.price, $gte: minPrice };
    }

    if (maxPrice !== null && !isNaN(maxPrice)) {
      query.price = { ...query.price, $lte: maxPrice };
    }

    if (rating !== null && !isNaN(rating) && rating > 0) {
      query.ratings = { $gte: rating };
    }

    if (brand) {
      const brandNames = brand.split(',');
      // Find brand IDs for the given names
      const distinctBrands = await Brand.find({ name: { $in: brandNames } }).select('_id');
      const brandIds = distinctBrands.map(b => b._id);

      if (brandIds.length > 0) {
        query.brand = { $in: brandIds };
      } else {
        // If names provided but no IDs found, force empty result or ignore
        // forcing empty result is safer to avoid showing everything
        query.brand = null;
      }
    }

    if (colorsParam) {
      query.colors = { $in: colorsParam.split(',') };
    }

    if (seasonParam) {
      query.season = { $in: seasonParam.split(',') };
    }

    if (featured) {
      query.isFeatured = true;
    }

    let searchEmbedding = null;
    let queryVector = null;
    let isSemanticSearch = false;

    if (search) {
      try {
        const embedArray = await getTextEmbedding(search);
        if (embedArray && Array.isArray(embedArray) && embedArray.length > 0) {
          searchEmbedding = embedArray;
          queryVector = searchEmbedding;
          isSemanticSearch = true;
        }
      } catch (e) {
        console.error("Semantic search embedding failed:", e);
      }

      if (!searchEmbedding) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
          { category: { $regex: search, $options: 'i' } },
          { subCategory: { $regex: search, $options: 'i' } },
          { occasion: { $regex: search, $options: 'i' } },
          { material: { $regex: search, $options: 'i' } }
        ];
      }
    }

    // --- Vector Search Logic ---
    if (!queryVector && (sortBy === 'createdAt' || sortBy === 'recommended') && !search) {
      const authResult = await authMiddleware(request);
      let customer = null;
      if (!authResult.error && authResult.user) {
        try {
          customer = await Customer.findOne({ userId: authResult.user.id });
          if (customer && customer.styleEmbedding && customer.styleEmbedding.length > 0) {
            queryVector = customer.styleEmbedding;
            // console.log(`User (${customer.userId}) has style embedding. Proceeding with Recommender Search...`);
          } else {
            // console.log(`User (${customer.userId}) authenticated, but NO style embedding exists on profile. Skipping Vector Search.`);
          }
        } catch (e) { console.error("Customer fetch error", e); }
      }
    }

    if (queryVector) {
      // console.log("\n--- USING VECTOR SEARCH ---");
      // console.log(`Type: ${isSemanticSearch ? "Semantic Keyword Search" : "User Profile Recommendation"}`);
      const vectorPipeline = [];

      // 1. Vector Search Stage
      vectorPipeline.push({
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 250,
          limit: 200, // Fetch top 200 matches to allow sorting by season later
          filter: { inStock: true }
        }
      });

      // 2. Match Stage (Apply other UI filters: category, price, brand, etc.)
      // Exclude inStock/season from 'query' here since vector search handled it? 
      // Actually, safest to re-apply 'query' to ensure strictness (e.g. minPrice) which VectorSearch filter might not support fully or easily
      // But we need to remove the parts vectorSearch already filtered if we want to avoid redundancy, 
      // however redundancy is fine.
      if (Object.keys(query).length > 0) {
        vectorPipeline.push({ $match: query });
      }

      // 3. Project Vector Score and Season Rank
      vectorPipeline.push({
        $addFields: {
          score: { $meta: "vectorSearchScore" },
          seasonRank: {
            $let: {
              vars: {
                idx: { $indexOfArray: [seasonPriority, { $ifNull: ["$season", "None"] }] }
              },
              in: { $cond: [{ $eq: ["$$idx", -1] }, 99, "$$idx"] }
            }
          }
        }
      });

      // Sort logic: priority depends on if it's semantic search vs seasonal recommendations
      if (isSemanticSearch) {
        vectorPipeline.push({ $sort: { score: -1 } });
      } else {
        vectorPipeline.push({ $sort: { seasonRank: 1, score: -1 } });
      }

      // 4. Pagination
      vectorPipeline.push({ $skip: (page - 1) * limit });
      vectorPipeline.push({ $limit: limit });

      // 5. Lookup Brand
      vectorPipeline.push({
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand"
        }
      });
      vectorPipeline.push({ $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } });



      // Execute Pipeline
      let products = await Product.aggregate(vectorPipeline);

      // --- Backfill Logic: If vector search results < limit, fill with standard sort ---
      if (products.length < limit) {
        const needed = limit - products.length;

        // Create fallback query excluding already found products
        const existingIds = products.map(p => p._id);
        const fallbackQuery = { ...query, _id: { $nin: existingIds } };

        // For semantic keyword search, if our embeddings yield too few results,
        // we should fallback to standard keyword match rather than random
        if (isSemanticSearch && search) {
          fallbackQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
            { category: { $regex: search, $options: 'i' } },
            { subCategory: { $regex: search, $options: 'i' } },
            { occasion: { $regex: search, $options: 'i' } },
            { material: { $regex: search, $options: 'i' } }
          ];
        }

        // Standard Sort (Newest) + SeasonRank fallback
        const fallbackPipeline = [
          { $match: fallbackQuery },
          {
            $addFields: {
              seasonRank: {
                $let: {
                  vars: {
                    idx: { $indexOfArray: [seasonPriority, { $ifNull: ["$season", "None"] }] }
                  },
                  in: { $cond: [{ $eq: ["$$idx", -1] }, 99, "$$idx"] }
                }
              }
            }
          },
          { $sort: isSemanticSearch ? { score: -1, createdAt: -1 } : { seasonRank: 1, createdAt: -1 } },
          { $limit: needed },
          {
            $lookup: {
              from: "brands",
              localField: "brand",
              foreignField: "_id",
              as: "brand"
            }
          },
          { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
          {
            $addFields: {
              brand: {
                _id: "$brand._id",
                name: "$brand.name",
                businessEmail: "$brand.businessEmail",
                logo: "$brand.logo"
              }
            }
          },
          { $project: { __v: 0 } }
        ];
        const fallbackProducts = await Product.aggregate(fallbackPipeline);

        products = [...products, ...fallbackProducts];
      }

      // Get total count (Approximation: use standard count of query)
      // This count includes non-vector matches, which is good for UX listing
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Get filters metadata concurrently (ONLY ON FIRST PAGE TO OPTIMIZE INFINITE SCROLL)
      let filtersData = {};
      if (page === 1) {
        const [categories, subCategories, distinctBrandIds, colors, seasons, priceRange] = await Promise.all([
          Product.distinct('category', { status: 'active' }),
          category
            ? Product.distinct('subCategory', { status: 'active', category })
            : Product.distinct('subCategory', { status: 'active' }),
          Product.distinct('brand', { status: 'active' }),
          Product.distinct('colors', { status: 'active' }),
          Product.distinct('season', { status: 'active' }),
          Product.aggregate([
            { $match: { status: 'active', inStock: true } },
            { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
          ])
        ]);
        const brandDocs = await Brand.find({ _id: { $in: distinctBrandIds } }).select('name').lean();
        const brands = brandDocs.map(b => b.name).sort();
        
        filtersData = {
          categories,
          subCategories,
          brands,
          colors,
          seasons,
          priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
        };
      }

      return NextResponse.json({
        success: true,
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage,
          hasPrevPage,
          limit
        },
        filters: filtersData
      });
    }
    // --------------------------------------------------

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price':
        sort.price = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'name':
        sort.name = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'popularity':
        sort.numReviews = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'rating':
        sort.ratings = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get products with pagination using aggregation for custom season sort
    const pipeline = [
      { $match: query },
      {
        $addFields: {
          seasonRank: {
            $let: {
              vars: {
                idx: { $indexOfArray: [seasonPriority, { $ifNull: ["$season", "None"] }] }
              },
              in: { $cond: [{ $eq: ["$$idx", -1] }, 99, "$$idx"] }
            }
          }
        }
      },
      { $sort: { seasonRank: 1, ...sort } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand"
        }
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          brand: {
            _id: "$brand._id",
            name: "$brand.name",
            businessEmail: "$brand.businessEmail",
            logo: "$brand.logo"
          }
        }
      },
      { $project: { __v: 0 } }
    ];

    const products = await Product.aggregate(pipeline);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    // Calculate pagination info
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get filter options for UI in parallel (ONLY ON FIRST PAGE TO OPTIMIZE INFINITE SCROLL)
    let filtersData = {};
    if (page === 1) {
      const [categories, subCategories, distinctBrandIds, colors, seasons, priceRange] = await Promise.all([
        Product.distinct('category', { status: 'active' }),
        category
          ? Product.distinct('subCategory', { status: 'active', category })
          : Product.distinct('subCategory', { status: 'active' }),
        Product.distinct('brand', { status: 'active' }),
        Product.distinct('colors', { status: 'active' }),
        Product.distinct('season', { status: 'active' }),
        Product.aggregate([
          { $match: { status: 'active', inStock: true } },
          { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
        ])
      ]);

      // Fetch actual Brand documents to get names
      const brandDocs = await Brand.find({ _id: { $in: distinctBrandIds } }).select('name').lean();
      const brands = brandDocs.map(b => b.name).sort();

      filtersData = {
        categories,
        subCategories,
        brands,
        colors,
        seasons,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
      };
    }

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage,
        hasPrevPage,
        limit
      },
      filters: filtersData
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
