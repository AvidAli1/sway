import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Order from '@/app/models/orderModel';
import Brand from '@/app/models/brandModel';
import Product from '@/app/models/productModel';
import { authMiddleware } from '@/utils/authMiddleware';
import mongoose from 'mongoose';

// GET /api/brand/orders/[id] - Get single order details
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

    // Find the brand
    const brand = await Brand.findOne({ owner: user.id });
    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    const { id } = params;

    // Find order
    const order = await Order.findById(id)
      .populate('customer', 'name email phone');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order contains brand's products
    const hasBrandProducts = order.items.some(
      item => item.productSnapshot.brand.businessEmail === brand.businessEmail
    );

    if (!hasBrandProducts) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Filter to show only brand's products
    const brandItems = order.items.filter(
      item => item.productSnapshot.brand.businessEmail === brand.businessEmail
    );

    const brandSubtotal = brandItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      success: true,
      order: {
        ...order.toObject(),
        items: brandItems,
        brandSubtotal
      }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

// PUT /api/brand/orders/[id] - Update order status
export async function PUT(request, { params }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDatabase();

    // Authenticate the request
    const authResult = await authMiddleware(request);
    if (authResult.error) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Check if user is a brand
    if (user.role !== 'brand') {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Access denied. Brand role required.' },
        { status: 403 }
      );
    }

    // Find the brand
    const brand = await Brand.findOne({ owner: user.id });
    if (!brand) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, note, trackingNumber, courierService, estimatedDelivery } = body;

    // Find order
    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order contains brand's products
    const hasBrandProducts = order.items.some(
      item => item.productSnapshot.brand.businessEmail === brand.businessEmail
    );

    if (!hasBrandProducts) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'cancelled': [],
      'returned': ['refunded'],
      'refunded': []
    };

    if (!validTransitions[order.status].includes(status)) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update order status
    await order.updateStatus(status, note, user.id);

    // Update delivery information if provided
    if (trackingNumber) {
      order.delivery.trackingNumber = trackingNumber;
    }
    if (courierService) {
      order.delivery.courierService = courierService;
    }
    if (estimatedDelivery) {
      order.delivery.estimatedDelivery = new Date(estimatedDelivery);
    }

    // If status is delivered, set actual delivery date
    if (status === 'delivered') {
      order.delivery.actualDelivery = new Date();
    }

    // If status is cancelled and payment was completed, initiate refund
    if (status === 'cancelled' && order.payment.status === 'completed') {
      order.payment.status = 'refunded';
      order.payment.refundedAt = new Date();
      order.payment.refundAmount = order.total;
      
      // Restore stock
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (product) {
          product.stock += item.quantity;
          product.inStock = true;
          await product.save({ session });
        }
      }
    }

    // Add brand note if provided
    if (note) {
      order.notes.brand = note;
    }

    await order.save({ session });
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        delivery: order.delivery
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
