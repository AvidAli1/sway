import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';
import Brand from '@/app/models/brandModel';

// GET /api/customer/products/search - Search products
export async function GET(request) {
  try {
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q'); // search query
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!q || q.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Build search query
    const searchQuery = {
      status: 'active',
      inStock: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { category: { $regex: q, $options: 'i' } },
        { subCategory: { $regex: q, $options: 'i' } },
        { material: { $regex: q, $options: 'i' } },
        { features: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    // Add category filter if provided
    if (category) {
      searchQuery.category = category;
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
      case 'rating':
        sort.ratings = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'popularity':
        sort.numReviews = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      default: // relevance - sort by name match first, then rating
        sort = { 
          name: 1, // Exact name matches first
          ratings: -1,
          numReviews: -1 
        };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Search products
    const products = await Product.find(searchQuery)
      .populate('brand', 'name businessEmail logo')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();

    // Get total count
    const totalProducts = await Product.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get search suggestions
    const suggestions = await Product.aggregate([
      { $match: searchQuery },
      { $group: { _id: '$category' } },
      { $limit: 5 }
    ]);

    // Get related searches (popular searches with similar terms)
    const relatedSearches = await Product.aggregate([
      { 
        $match: { 
          status: 'active',
          inStock: true,
          tags: { $in: [new RegExp(q.split(' ')[0], 'i')] }
        } 
      },
      { $unwind: '$tags' },
      { 
        $match: { 
          tags: { $regex: q.split(' ')[0], $options: 'i' } 
        } 
      },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return NextResponse.json({
      success: true,
      query: q,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      },
      suggestions: suggestions.map(s => s._id),
      relatedSearches: relatedSearches.map(r => r._id)
    });

  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
