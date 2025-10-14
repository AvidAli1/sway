import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';
import Brand from '@/app/models/brandModel';

// GET /api/customer/products/[id] - Get single product details for customers
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;

    // Find the product (only active and in stock)
    const product = await Product.findOne({ 
      _id: id, 
      status: 'active',
      inStock: true 
    }).populate('brand', 'name businessEmail logo description address');

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    // Get related products (same category, different product)
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      status: 'active',
      inStock: true
    })
    .populate('brand', 'name businessEmail logo')
    .limit(8)
    .select('name price originalPrice discount thumbnail images ratings numReviews slug')
    .lean();

    // Get similar products (same brand, different product)
    const similarProducts = await Product.find({
      _id: { $ne: id },
      brand: product.brand._id,
      status: 'active',
      inStock: true
    })
    .populate('brand', 'name businessEmail logo')
    .limit(6)
    .select('name price originalPrice discount thumbnail images ratings numReviews slug')
    .lean();

    return NextResponse.json({
      success: true,
      product,
      relatedProducts,
      similarProducts
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
