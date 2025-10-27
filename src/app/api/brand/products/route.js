import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';
import Brand from '@/app/models/brandModel';
import { uploadProductImages } from '@/utils/AWS';
import { authMiddleware } from '@/utils/authMiddleware';

// GET /api/brand/products - Get all products for a brand
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || 'active';
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build query
    const query = { brand: brand._id };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get products with pagination
    const products = await Product.find(query)
      .populate('brand', 'name businessEmail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
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

// POST /api/brand/products - Create a new product
export async function POST(request) {
  try {
    console.log('POST /api/brand/products - Starting request');
    await connectToDatabase();
    console.log('Database connected');

    // Authenticate the request
    console.log('Authenticating request...');
    const authResult = await authMiddleware(request);
    console.log('Auth result:', authResult);
    
    if (authResult.error) {
      console.log('Authentication failed:', authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    console.log('User authenticated:', user.email, user.role);

    // Check if user is a brand
    if (user.role !== 'brand') {
      console.log('User role is not brand:', user.role);
      return NextResponse.json(
        { error: 'Access denied. Brand role required.' },
        { status: 403 }
      );
    }

    // Find the brand associated with this user
    console.log('Looking for brand with owner:', user.id);
    const brand = await Brand.findOne({ owner: user.id });
    console.log('Brand found:', brand ? brand.name : 'No brand found');
    
    if (!brand) {
      console.log('Brand not found for user:', user.id);
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();

    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    // Extract product data
    const originalPrice = parseFloat(formData.get('originalPrice')) || 0;
    const discountPercentage = parseFloat(formData.get('discount')) || 0;
    
    // Calculate price based on original price and discount
    const calculatedPrice = originalPrice > 0 && discountPercentage > 0 
      ? originalPrice - (originalPrice * discountPercentage / 100)
      : originalPrice;

    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      subCategory: formData.get('subCategory'),
      originalPrice: originalPrice,
      price: calculatedPrice,
      currency: formData.get('currency') || 'PKR',
      discount: discountPercentage,
      stock: parseInt(formData.get('stock')) || 0,
      inStock: formData.get('inStock') === 'true',
      gender: formData.get('gender') || 'unisex',
      material: formData.get('material'),
      fitType: formData.get('fitType'),
      occasion: formData.get('occasion'),
      careInstructions: formData.get('careInstructions'),
      isFeatured: formData.get('isFeatured') === 'true',
      status: formData.get('status') || 'active',
      brand: brand._id
    };

    // Parse arrays
    const sizes = formData.get('sizes') ? JSON.parse(formData.get('sizes')) : [];
    const colors = formData.get('colors') ? JSON.parse(formData.get('colors')) : [];
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags')) : [];
    const features = formData.get('features') ? JSON.parse(formData.get('features')) : [];
    const specifications = formData.get('specifications') ? JSON.parse(formData.get('specifications')) : [];

    console.log('Product data:', productData);
    console.log('Original price:', originalPrice);
    console.log('Calculated price:', calculatedPrice);
    
    // Validate required fields
    if (!productData.name || !productData.category || !originalPrice) {
      console.log('Validation failed:', {
        name: productData.name,
        category: productData.category,
        originalPrice: originalPrice
      });
      return NextResponse.json(
        { error: 'Name, category, and original price are required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Generate SKU
    const sku = `${brand.name.toUpperCase().substring(0, 3)}-${Date.now()}`;

    // Process images
    const images = [];
    const thumbnailFiles = formData.getAll('thumbnail');
    const imageFiles = formData.getAll('images');

    // Process thumbnail and product images. Skip problematic files but record their names.
    const failedImages = []

    // Process thumbnail
    if (thumbnailFiles && thumbnailFiles.length > 0 && thumbnailFiles[0].size > 0) {
      const thumbnailFile = thumbnailFiles[0];
      try {
        const thumbnailBuffer = await thumbnailFile.arrayBuffer();
        const thumbnailResult = await uploadProductImages(
          Buffer.from(thumbnailBuffer),
          thumbnailFile.name,
          thumbnailFile.type
        );
        productData.thumbnail = thumbnailResult;
      } catch (err) {
        console.error('Thumbnail upload failed, skipping thumbnail:', thumbnailFile.name, err);
        failedImages.push(thumbnailFile.name || 'thumbnail');
        productData.thumbnail = null;
      }
    }

    // Process product images
    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        if (imageFile.size > 0) {
          try {
            const imageBuffer = await imageFile.arrayBuffer();
            const imageResult = await uploadProductImages(
              Buffer.from(imageBuffer),
              imageFile.name,
              imageFile.type
            );
            images.push(imageResult);
          } catch (err) {
            console.error('Error processing and uploading product image (skipping):', imageFile.name, err);
            failedImages.push(imageFile.name || 'unknown');
            // continue with next image
            continue;
          }
        }
      }
    }

    // Create product
    console.log('Creating product with data:', {
      ...productData,
      slug,
      sku,
      sizes,
      colors,
      tags,
      features,
      specifications,
      images
    });
    
    const product = new Product({
      ...productData,
      slug,
      sku,
      sizes,
      colors,
      tags,
      features,
      specifications,
      images
    });

    console.log('Product created, saving...');
    await product.save();
    console.log('Product saved successfully');

    // Populate brand data for response
    await product.populate('brand', 'name businessEmail');
    console.log('Product populated, sending response');

    const responsePayload = {
      success: true,
      message: 'Product created successfully',
      product
    };

    if (failedImages.length > 0) {
      responsePayload.warnings = {
        message: 'Some images were skipped due to processing/format errors',
        files: failedImages
      };
      console.log('Some images failed to process:', failedImages);
    }

    return NextResponse.json(responsePayload, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    
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
