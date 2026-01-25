import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';
import Brand from '@/app/models/brandModel';

// GET /api/customer/products - Get products for customers with infinite scroll
export async function GET(request) {
  try {
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12; // Default 12 for grid layout
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const gender = searchParams.get('gender');
    const minPrice = parseFloat(searchParams.get('minPrice'));
    const maxPrice = parseFloat(searchParams.get('maxPrice'));
    const brand = searchParams.get('brand');
    const colorsParam = searchParams.get('colors');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, price, name, popularity
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // asc, desc
    const featured = searchParams.get('featured') === 'true';

    // Build query - only show active products
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

    if (featured) {
      query.isFeatured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { category: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } }
      ];
    }

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

    // Get products with pagination
    const products = await Product.find(query)
      .populate('brand', 'name businessEmail logo')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v') // Exclude version field
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    // Calculate pagination info
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get filter options for UI
    const categories = await Product.distinct('category', { status: 'active' });
    const subCategories = category ?
      await Product.distinct('subCategory', { status: 'active', category }) :
      await Product.distinct('subCategory', { status: 'active' });
    const distinctBrandIds = await Product.distinct('brand', { status: 'active' });
    // Fetch actual Brand documents to get names
    const brandDocs = await Brand.find({ _id: { $in: distinctBrandIds } }).select('name').lean();
    const brands = brandDocs.map(b => b.name).sort();

    // Get distinct colors
    const colors = await Product.distinct('colors', { status: 'active' });

    // Get price range
    const priceRange = await Product.aggregate([
      { $match: { status: 'active', inStock: true } },
      { $group: { _id: null, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } }
    ]);

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
      filters: {
        categories,
        subCategories,
        brands,
        colors,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
