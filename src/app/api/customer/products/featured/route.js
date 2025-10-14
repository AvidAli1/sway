import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';

// GET /api/customer/products/featured - Get featured products
export async function GET(request) {
  try {
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 12;

    // Get featured products
    const featuredProducts = await Product.find({
      status: 'active',
      inStock: true,
      isFeatured: true
    })
    .populate('brand', 'name businessEmail logo')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v')
    .lean();

    return NextResponse.json({
      success: true,
      products: featuredProducts,
      count: featuredProducts.length
    });

  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
