import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';
import Brand from '@/app/models/brandModel';
import { uploadProductImages } from '@/utils/AWS';
import { authMiddleware } from '@/utils/authMiddleware';

// POST /api/brand/products/[id]/images - Add images to a product
export async function POST(request, { params }) {
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
    const imageFiles = formData.getAll('images');
    const indexParam = formData.get('index');
    const index = indexParam !== null ? parseInt(indexParam) : product.images.length; // Default to end

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    // Process new images
    const newImages = [];
    for (const imageFile of imageFiles) {
      if (imageFile.size > 0) {
        const imageBuffer = await imageFile.arrayBuffer();
        const imageResult = await uploadProductImages(
          Buffer.from(imageBuffer),
          imageFile.name,
          imageFile.type
        );
        newImages.push(imageResult);
      }
    }

    if (newImages.length === 0) {
      return NextResponse.json(
        { error: 'No valid images processed' },
        { status: 400 }
      );
    }

    // Insert images at specified index
    const updatedImages = [...product.images];
    updatedImages.splice(index, 0, ...newImages);

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { images: updatedImages },
      { new: true, runValidators: true }
    ).populate('brand', 'name businessEmail');

    return NextResponse.json({
      success: true,
      message: `${newImages.length} image(s) added successfully`,
      product: updatedProduct,
      addedImages: newImages
    });

  } catch (error) {
    console.error('Error adding images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/brand/products/[id]/images - Delete specific images from a product
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

    // Get image indices to delete from query parameters
    const { searchParams } = new URL(request.url);
    const indicesParam = searchParams.get('indices');
    
    if (!indicesParam) {
      return NextResponse.json(
        { error: 'Image indices are required' },
        { status: 400 }
      );
    }

    // Parse indices (comma-separated)
    const indices = indicesParam.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i));
    
    if (indices.length === 0) {
      return NextResponse.json(
        { error: 'No valid indices provided' },
        { status: 400 }
      );
    }

    // Validate indices
    const validIndices = indices.filter(index => index >= 0 && index < product.images.length);
    
    if (validIndices.length === 0) {
      return NextResponse.json(
        { error: 'No valid image indices found' },
        { status: 400 }
      );
    }

    // Remove images at specified indices (sort in descending order to avoid index shifting)
    const updatedImages = [...product.images];
    const sortedIndices = validIndices.sort((a, b) => b - a);
    
    for (const index of sortedIndices) {
      updatedImages.splice(index, 1);
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { images: updatedImages },
      { new: true, runValidators: true }
    ).populate('brand', 'name businessEmail');

    return NextResponse.json({
      success: true,
      message: `${validIndices.length} image(s) deleted successfully`,
      product: updatedProduct,
      deletedIndices: validIndices
    });

  } catch (error) {
    console.error('Error deleting images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
