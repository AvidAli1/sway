import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Cart from '@/app/models/cartModel';
import { authMiddleware } from '@/utils/authMiddleware';

// GET /api/customer/cart/[itemId] - Get specific cart item
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

    // Check if user is a customer
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Access denied. Customer role required.' },
        { status: 403 }
      );
    }

    const { itemId } = await params;

    // Find cart
    const cart = await Cart.findOne({ customer: user.id, status: 'active' });

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Find the specific item
    const item = cart.items.id(itemId);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // Populate product details
    await item.populate({
      path: 'product',
      select: 'name price originalPrice discount images thumbnail stock inStock status brand',
      populate: {
        path: 'brand',
        select: 'name businessEmail'
      }
    });

    return NextResponse.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('Error fetching cart item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart item' },
      { status: 500 }
    );
  }
}

// PUT /api/customer/cart/[itemId] - Update cart item quantity
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

    // Check if user is a customer
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Access denied. Customer role required.' },
        { status: 403 }
      );
    }

    const { itemId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    // Validate itemId format (MongoDB ObjectId)
    if (!itemId || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID format. Please use a valid cart item ID (not product ID).' },
        { status: 400 }
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

    // Check if item exists in cart before updating
    const existingItem = cart.items.id(itemId);
    if (!existingItem) {
      return NextResponse.json(
        { 
          error: 'Item not found in cart',
          hint: 'Make sure you are using the cart item ID (from items[]._id), not the product ID'
        },
        { status: 404 }
      );
    }

    // Update item quantity
    await cart.updateItemQuantity(itemId, quantity);

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice discount images thumbnail'
    });

    return NextResponse.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated successfully',
      cart
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    
    if (error.message === 'Item not found in cart') {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/customer/cart/[itemId] - Remove item from cart
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

    // Check if user is a customer
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Access denied. Customer role required.' },
        { status: 403 }
      );
    }

    const { itemId } = await params;

    // Validate itemId format (MongoDB ObjectId)
    if (!itemId || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID format. Please use a valid cart item ID (not product ID).' },
        { status: 400 }
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

    // Check if item exists in cart before removing
    const existingItem = cart.items.id(itemId);
    if (!existingItem) {
      return NextResponse.json(
        { 
          error: 'Item not found in cart',
          hint: 'Make sure you are using the cart item ID (from items[]._id), not the product ID'
        },
        { status: 404 }
      );
    }

    // Remove item
    await cart.removeItem(itemId);

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice discount images thumbnail'
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
      cart
    });

  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
