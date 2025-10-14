import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';
import Brand from '@/app/models/brandModel';
import { uploadProductImages } from '@/utils/AWS';
import { authMiddleware } from '@/utils/authMiddleware';

// GET /api/brand/products/[id] - Get a single product
export async function GET(request, { params }) {
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
    }).populate('brand', 'name businessEmail');

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/brand/products/[id] - Update a product
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
    
    // Extract product data
    const updateData = {};
    
    // Handle price calculation
    const originalPrice = formData.get('originalPrice');
    const discountPercentage = formData.get('discount');
    
    if (originalPrice !== null || discountPercentage !== null) {
      const currentOriginalPrice = originalPrice !== null ? parseFloat(originalPrice) : product.originalPrice;
      const currentDiscount = discountPercentage !== null ? parseFloat(discountPercentage) : product.discount;
      
      // Calculate new price based on original price and discount
      const calculatedPrice = currentOriginalPrice > 0 && currentDiscount > 0 
        ? currentOriginalPrice - (currentOriginalPrice * currentDiscount / 100)
        : currentOriginalPrice;
      
      updateData.originalPrice = currentOriginalPrice;
      updateData.discount = currentDiscount;
      updateData.price = calculatedPrice;
    }

    // Update basic fields (excluding price-related fields as they're handled above)
    const fieldsToUpdate = [
      'name', 'description', 'category', 'subCategory', 'currency', 
      'stock', 'inStock', 'gender', 'material', 'fitType', 'occasion', 
      'careInstructions', 'isFeatured', 'status'
    ];

    fieldsToUpdate.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'stock') {
          updateData[field] = parseInt(value) || 0;
        } else if (field === 'inStock' || field === 'isFeatured') {
          updateData[field] = value === 'true';
        } else {
          updateData[field] = value;
        }
      }
    });

    // Update arrays
    const arrayFields = ['sizes', 'colors', 'tags', 'features', 'specifications'];
    arrayFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        updateData[field] = value ? JSON.parse(value) : [];
      }
    });

    // Update slug if name changed
    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Note: Image handling is done through separate endpoints
    // This endpoint only handles textual field updates

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('brand', 'name businessEmail');

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `Product with this ${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/brand/products/[id] - Delete a product
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

    // Find and delete the product
    const product = await Product.findOneAndDelete({ 
      _id: id, 
      brand: brand._id 
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
