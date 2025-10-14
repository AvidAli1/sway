import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Cart from '@/app/models/cartModel';
import Product from '@/app/models/productModel';
import { authMiddleware } from '@/utils/authMiddleware';

// GET /api/customer/cart - Get customer's cart
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

    // Check if user is a customer
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Access denied. Customer role required.' },
        { status: 403 }
      );
    }

    // Find or create cart for customer
    const cart = await Cart.findOrCreateCart(user.id);

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice discount images thumbnail stock inStock status brand',
      populate: {
        path: 'brand',
        select: 'name businessEmail'
      }
    });

    // Check for any unavailable products or price changes
    const unavailableItems = [];
    const priceChanges = [];

    cart.items.forEach(item => {
      if (!item.product || item.product.status !== 'active' || !item.product.inStock) {
        unavailableItems.push({
          itemId: item._id,
          productName: item.product?.name || 'Unknown Product',
          reason: !item.product ? 'Product not found' : 
                  item.product.status !== 'active' ? 'Product unavailable' : 
                  'Out of stock'
        });
      } else {
        // Check for price changes
        if (item.price !== item.product.price) {
          priceChanges.push({
            itemId: item._id,
            productName: item.product.name,
            oldPrice: item.price,
            newPrice: item.product.price
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      cart,
      warnings: {
        unavailableItems,
        priceChanges
      }
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/customer/cart - Add item to cart
export async function POST(request) {
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

    // Check if user is a customer
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Access denied. Customer role required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { productId, quantity, size, color } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is available
    if (product.status !== 'active' || !product.inStock) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }

    // Check stock availability
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available in stock` },
        { status: 400 }
      );
    }

    // Validate size if provided
    if (size && product.sizes.length > 0 && !product.sizes.includes(size)) {
      return NextResponse.json(
        { error: 'Invalid size selected' },
        { status: 400 }
      );
    }

    // Validate color if provided
    if (color && product.colors.length > 0 && !product.colors.includes(color)) {
      return NextResponse.json(
        { error: 'Invalid color selected' },
        { status: 400 }
      );
    }

    // Find or create cart
    const cart = await Cart.findOrCreateCart(user.id);

    // Add item to cart
    await cart.addItem(
      productId,
      quantity,
      size || null,
      color || null,
      product.price,
      product.originalPrice,
      product.discount
    );

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice discount images thumbnail'
    });

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      cart
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/customer/cart - Clear entire cart
export async function DELETE(request) {
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

    // Check if user is a customer
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Access denied. Customer role required.' },
        { status: 403 }
      );
    }

    // Find cart
    const cart = await Cart.findOne({ customer: user.id, status: 'active' });

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Clear cart
    await cart.clearCart();

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
