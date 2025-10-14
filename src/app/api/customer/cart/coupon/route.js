import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Cart from '@/app/models/cartModel';
import { authMiddleware } from '@/utils/authMiddleware';

// POST /api/customer/cart/coupon - Apply coupon code
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
    const { couponCode } = body;

    if (!couponCode) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
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

    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cannot apply coupon to empty cart' },
        { status: 400 }
      );
    }

    // Validate coupon code (this is a simple example, you can expand with a Coupon model)
    const validCoupons = {
      'SAVE10': { type: 'percentage', value: 10, minOrder: 1000 },
      'SAVE100': { type: 'fixed', value: 100, minOrder: 500 },
      'SAVE20': { type: 'percentage', value: 20, minOrder: 5000 },
      'FREESHIP': { type: 'shipping', value: 200, minOrder: 0 },
      'WELCOME15': { type: 'percentage', value: 15, minOrder: 2000 }
    };

    const coupon = validCoupons[couponCode.toUpperCase()];

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 400 }
      );
    }

    // Check minimum order value
    if (cart.subtotal < coupon.minOrder) {
      return NextResponse.json(
        { error: `Minimum order value of ${coupon.minOrder} PKR required` },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round(cart.subtotal * coupon.value / 100);
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
    } else if (coupon.type === 'shipping') {
      discountAmount = coupon.value; // Shipping discount
    }

    // Apply coupon
    await cart.applyCoupon(couponCode.toUpperCase(), discountAmount);

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice discount images thumbnail'
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully',
      cart,
      couponDetails: {
        code: couponCode.toUpperCase(),
        type: coupon.type,
        discount: discountAmount
      }
    });

  } catch (error) {
    console.error('Error applying coupon:', error);
    return NextResponse.json(
      { error: 'Failed to apply coupon' },
      { status: 500 }
    );
  }
}

// DELETE /api/customer/cart/coupon - Remove coupon
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

    // Remove coupon
    await cart.removeCoupon();

    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'name price originalPrice discount images thumbnail'
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon removed successfully',
      cart
    });

  } catch (error) {
    console.error('Error removing coupon:', error);
    return NextResponse.json(
      { error: 'Failed to remove coupon' },
      { status: 500 }
    );
  }
}
