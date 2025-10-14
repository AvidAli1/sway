import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Order from '@/app/models/orderModel';
import Product from '@/app/models/productModel';
import { authMiddleware } from '@/utils/authMiddleware';
import mongoose from 'mongoose';

// GET /api/customer/orders/[id] - Get single order details
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

    const { id } = params;

    // Find order
    const order = await Order.findOne({
      _id: id,
      customer: user.id
    }).populate('customer', 'name email phone');

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

// PUT /api/customer/orders/[id] - Update order (for cancellation)
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

    // Check if user is a customer
    if (user.role !== 'customer') {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Access denied. Customer role required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { action, reason } = body;

    // Find order
    const order = await Order.findOne({
      _id: id,
      customer: user.id
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Handle different actions
    if (action === 'cancel') {
      // Only allow cancellation if order is pending or confirmed
      if (!['pending', 'confirmed'].includes(order.status)) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: `Cannot cancel order with status: ${order.status}` },
          { status: 400 }
        );
      }

      // Restore stock for all items
      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);
        if (product) {
          product.stock += item.quantity;
          product.inStock = true;
          await product.save({ session });
        }
      }

      // Update order status
      order.status = 'cancelled';
      order.cancellation = {
        reason: reason || 'Cancelled by customer',
        cancelledBy: user.id,
        cancelledAt: new Date(),
        refundAmount: order.payment.status === 'completed' ? order.total : 0,
      };

      await order.updateStatus('cancelled', reason || 'Cancelled by customer', user.id);
      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: 'Order cancelled successfully',
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          refundAmount: order.cancellation.refundAmount,
        }
      });

    } else if (action === 'request_return') {
      // Only allow return if order is delivered
      if (order.status !== 'delivered') {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'Can only request return for delivered orders' },
          { status: 400 }
        );
      }

      // Check if return window is still open (7 days)
      const deliveryDate = order.delivery.actualDelivery || order.createdAt;
      const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceDelivery > 7) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: 'Return window has expired (7 days from delivery)' },
          { status: 400 }
        );
      }

      order.return = {
        reason: reason || 'Customer return request',
        requestedAt: new Date(),
        returnStatus: 'requested',
      };

      await order.updateStatus('returned', `Return requested: ${reason}`, user.id);
      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: 'Return request submitted successfully',
        order: {
          orderNumber: order.orderNumber,
          returnStatus: order.return.returnStatus,
        }
      });

    } else {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

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
