import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';

// GET /api/customer/products/recommendations - Get product recommendations
export async function GET(request) {
  try {
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 12;
    const category = searchParams.get('category');
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId'); // For future user-based recommendations

    let recommendations = [];

    if (productId) {
      // Get the current product
      const currentProduct = await Product.findById(productId);
      
      if (currentProduct) {
        // Get recommendations based on current product
        const categoryRecommendations = await Product.find({
          _id: { $ne: productId },
          category: currentProduct.category,
          status: 'active',
          inStock: true
        })
        .populate('brand', 'name businessEmail logo')
        .sort({ ratings: -1, numReviews: -1 })
        .limit(Math.floor(limit / 2))
        .select('-__v')
        .lean();

        // Get recommendations based on similar price range
        const priceRange = currentProduct.price * 0.2; // 20% variance
        const priceRecommendations = await Product.find({
          _id: { $ne: productId },
          price: { 
            $gte: currentProduct.price - priceRange,
            $lte: currentProduct.price + priceRange
          },
          status: 'active',
          inStock: true
        })
        .populate('brand', 'name businessEmail logo')
        .sort({ ratings: -1, numReviews: -1 })
        .limit(Math.floor(limit / 2))
        .select('-__v')
        .lean();

        // Combine and deduplicate
        const allRecommendations = [...categoryRecommendations, ...priceRecommendations];
        const seen = new Set();
        recommendations = allRecommendations.filter(product => {
          if (seen.has(product._id.toString())) {
            return false;
          }
          seen.add(product._id.toString());
          return true;
        }).slice(0, limit);

      }
    } else if (category) {
      // Get recommendations based on category
      recommendations = await Product.find({
        category: category,
        status: 'active',
        inStock: true
      })
      .populate('brand', 'name businessEmail logo')
      .sort({ ratings: -1, numReviews: -1, createdAt: -1 })
      .limit(limit)
      .select('-__v')
      .lean();
    } else {
      // Get general recommendations (trending/popular products)
      recommendations = await Product.find({
        status: 'active',
        inStock: true,
        isFeatured: true
      })
      .populate('brand', 'name businessEmail logo')
      .sort({ ratings: -1, numReviews: -1, createdAt: -1 })
      .limit(limit)
      .select('-__v')
      .lean();
    }

    // If we don't have enough recommendations, fill with trending products
    if (recommendations.length < limit) {
      const trendingProducts = await Product.find({
        _id: { $nin: recommendations.map(p => p._id) },
        status: 'active',
        inStock: true
      })
      .populate('brand', 'name businessEmail logo')
      .sort({ numReviews: -1, createdAt: -1 })
      .limit(limit - recommendations.length)
      .select('-__v')
      .lean();

      recommendations = [...recommendations, ...trendingProducts];
    }

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
      type: productId ? 'product-based' : category ? 'category-based' : 'trending'
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
