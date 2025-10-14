import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Order from '@/app/models/orderModel';
import Product from '@/app/models/productModel';
import { authMiddleware } from '@/utils/authMiddleware';
import mongoose from 'mongoose';

// POST /api/customer/orders - Create a new order
export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

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
    const { items, shippingAddress, payment, notes, isGift, giftMessage } = body;

    // Validate required fields
    if (!items || !items.length) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    if (!payment || !payment.method) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Process order items and validate stock
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      // Find product
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      // Check if product is active and in stock
      if (product.status !== 'active' || !product.inStock) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: `Product is not available: ${product.name}` },
          { status: 400 }
        );
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
          { status: 400 }
        );
      }

      // Validate size and color if provided
      if (item.size && !product.sizes.includes(item.size)) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: `Invalid size for ${product.name}` },
          { status: 400 }
        );
      }

      if (item.color && !product.colors.includes(item.color)) {
        await session.abortTransaction();
        return NextResponse.json(
          { error: `Invalid color for ${product.name}` },
          { status: 400 }
        );
      }

      // Reduce stock
      product.stock -= item.quantity;
      if (product.stock === 0) {
        product.inStock = false;
      }
      await product.save({ session });

      // Populate brand for snapshot
      await product.populate('brand', 'name businessEmail');

      // Calculate item total
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      // Create processed item with snapshot
      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        size: item.size || null,
        color: item.color || null,
        productSnapshot: {
          name: product.name,
          description: product.description,
          images: product.images,
          thumbnail: product.thumbnail,
          brand: {
            name: product.brand.name,
            businessEmail: product.brand.businessEmail,
          },
          sku: product.sku,
        }
      });
    }

    // Calculate order totals
    const shippingCost = subtotal >= 5000 ? 0 : 200; // Free shipping over 5000
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const discount = 0; // Can be calculated based on coupon codes
    const total = subtotal - discount + shippingCost + tax;

    // Create order
    const order = new Order({
      customer: user.id,
      items: processedItems,
      subtotal,
      discount,
      shippingCost,
      tax,
      total,
      shippingAddress,
      payment: {
        method: payment.method,
        status: payment.method === 'cash_on_delivery' ? 'pending' : payment.status || 'pending',
        transactionId: payment.transactionId,
        paymentGateway: payment.paymentGateway,
      },
      notes: {
        customer: notes || '',
      },
      isGift: isGift || false,
      giftMessage: giftMessage || '',
      source: 'web',
    });

    await order.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Populate order for response
    await order.populate('customer', 'name email phone');

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: {
        orderNumber: order.orderNumber,
        _id: order._id,
        total: order.total,
        status: order.status,
        items: order.items.length,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    }, { status: 201 });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}

// GET /api/customer/orders - Get customer's order history
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');

    // Build query
    const query = { customer: user.id };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('orderNumber items subtotal discount shippingCost tax total status payment.status createdAt delivery.estimatedDelivery')
      .lean();

    // Get total count
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
