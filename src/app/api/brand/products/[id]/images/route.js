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

    const { id } = await params;

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

    const { id } = await params;

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

// PUT /api/brand/products/[id]/images - Reorder images
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

    const { id } = await params;

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

    // Get parameters from query string
    const { searchParams } = new URL(request.url);
    const fromIndex = searchParams.get('fromIndex');
    const toIndex = searchParams.get('toIndex');

    if (fromIndex === null || toIndex === null) {
      return NextResponse.json(
        { error: 'fromIndex and toIndex are required' },
        { status: 400 }
      );
    }

    const from = parseInt(fromIndex);
    const to = parseInt(toIndex);

    if (isNaN(from) || isNaN(to)) {
      return NextResponse.json(
        { error: 'Invalid indices provided' },
        { status: 400 }
      );
    }

    if (from < 0 || from >= product.images.length || to < 0 || to >= product.images.length) {
      return NextResponse.json(
        { error: 'Index out of bounds' },
        { status: 400 }
      );
    }

    if (from === to) {
      return NextResponse.json(
        { error: 'Source and destination indices are the same' },
        { status: 400 }
      );
    }

    // Reorder the images array
    const updatedImages = [...product.images];
    const [movedImage] = updatedImages.splice(from, 1);
    updatedImages.splice(to, 0, movedImage);

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { images: updatedImages },
      { new: true, runValidators: true }
    ).populate('brand', 'name businessEmail');

    return NextResponse.json({
      success: true,
      message: 'Image reordered successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error reordering images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}