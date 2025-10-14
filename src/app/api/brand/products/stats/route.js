import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';
import Brand from '@/app/models/brandModel';
import { authMiddleware } from '@/utils/authMiddleware';

// GET /api/brand/products/stats - Get product statistics for a brand
export async function GET(request) {
  try {
    await connectToDatabase();

    // Authenticate the request
    const authResult = await authMiddleware(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Check if user is a brand
    if (user.role !== 'brand') {
      return NextResponse.json(
        { error: 'Access denied. Brand role required.' },
        { status: 403 }
      );
    }

    // Find the brand associated with this user
    const brand = await Brand.findOne({ owner: user.id });
    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Get product statistics
    const totalProducts = await Product.countDocuments({ brand: brand._id });
    const activeProducts = await Product.countDocuments({ 
      brand: brand._id, 
      status: 'active' 
    });
    const inactiveProducts = await Product.countDocuments({ 
      brand: brand._id, 
      status: 'inactive' 
    });
    const draftProducts = await Product.countDocuments({ 
      brand: brand._id, 
      status: 'draft' 
    });
    const featuredProducts = await Product.countDocuments({ 
      brand: brand._id, 
      isFeatured: true 
    });
    const outOfStockProducts = await Product.countDocuments({ 
      brand: brand._id, 
      inStock: false 
    });

    // Get category distribution
    const categoryStats = await Product.aggregate([
      { $match: { brand: brand._id } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        totalValue: { $sum: '$price' }
      }},
      { $sort: { count: -1 } }
    ]);

    // Get recent products
    const recentProducts = await Product.find({ brand: brand._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price status createdAt')
      .lean();

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        draftProducts,
        featuredProducts,
        outOfStockProducts,
        categoryStats,
        recentProducts
      }
    });

  } catch (error) {
    console.error('Error fetching product stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
