import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';
import Brand from '@/app/models/brandModel';
import { uploadProductImages } from '@/utils/AWS';
import { authMiddleware } from '@/utils/authMiddleware';

// PUT /api/brand/products/[id]/thumbnail - Update product thumbnail
export async function PUT(request, { params }) {
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

    const { id } = params;

    // Find the product
    const product = await Product.findOne({ 
      _id: id, 
      brand: brand._id 
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const thumbnailFile = formData.get('thumbnail');

    if (!thumbnailFile || thumbnailFile.size === 0) {
      return NextResponse.json(
        { error: 'No thumbnail image provided' },
        { status: 400 }
      );
    }

    // Process thumbnail
    const thumbnailBuffer = await thumbnailFile.arrayBuffer();
    const thumbnailResult = await uploadProductImages(
      Buffer.from(thumbnailBuffer),
      thumbnailFile.name,
      thumbnailFile.type
    );

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { thumbnail: thumbnailResult },
      { new: true, runValidators: true }
    ).populate('brand', 'name businessEmail');

    return NextResponse.json({
      success: true,
      message: 'Thumbnail updated successfully',
      product: updatedProduct,
      thumbnail: thumbnailResult
    });

  } catch (error) {
    console.error('Error updating thumbnail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/brand/products/[id]/thumbnail - Remove product thumbnail
export async function DELETE(request, { params }) {
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

    const { id } = params;

    // Find the product
    const product = await Product.findOne({ 
      _id: id, 
      brand: brand._id 
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the product to remove thumbnail
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $unset: { thumbnail: 1 } },
      { new: true, runValidators: true }
    ).populate('brand', 'name businessEmail');

    return NextResponse.json({
      success: true,
      message: 'Thumbnail removed successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error removing thumbnail:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
