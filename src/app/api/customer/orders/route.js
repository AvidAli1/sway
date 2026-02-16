import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Order from '@/app/models/orderModel';
import Product from '@/app/models/productModel';
import Customer from '@/app/models/customerModel';
import { authMiddleware } from '@/utils/authMiddleware';
import mongoose from 'mongoose';

// POST /api/customer/orders - Create a new order
export async function POST(request) {
  const maxRetries = 3;
  let retryCount = 0;

  await connectToDatabase();

  // Authenticate the request (only once, before retry loop)
  const authResult = await authMiddleware(request);
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { user } = authResult;

  // Check if user is a customer (only once)
  if (user.role !== 'customer') {
    return NextResponse.json(
      { error: 'Access denied. Customer role required.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { items, shippingAddress, payment, notes, isGift, giftMessage } = body;

  // Validate required fields (only once)
  if (!items || !items.length) {
    return NextResponse.json(
      { error: 'Order items are required' },
      { status: 400 }
    );
  }

  if (!shippingAddress) {
    return NextResponse.json(
      { error: 'Shipping address is required' },
      { status: 400 }
    );
  }

  if (!payment || !payment.method) {
    return NextResponse.json(
      { error: 'Payment method is required' },
      { status: 400 }
    );
  }

  // Retry loop for transaction operations
  while (retryCount < maxRetries) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      // Process order items and validate stock
      const processedItems = [];
      let subtotal = 0;

      for (const item of items) {
        // Find product
        const product = await Product.findById(item.productId).session(session);

        if (!product) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            { error: `Product not found: ${item.productId}` },
            { status: 404 }
          );
        }

        // Check if product is active and in stock
        if (product.status !== 'active' || !product.inStock) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            { error: `Product is not available: ${product.name}` },
            { status: 400 }
          );
        }

        // Check stock availability
        if (product.stock < item.quantity) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}. Available: ${product.stock}` },
            { status: 400 }
          );
        }

        // Validate size and color if provided
        if (item.size && !product.sizes.includes(item.size)) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            { error: `Invalid size for ${product.name}` },
            { status: 400 }
          );
        }

        if (item.color && !product.colors.includes(item.color)) {
          await session.abortTransaction();
          session.endSession();
          return NextResponse.json(
            { error: `Invalid color for ${product.name}` },
            { status: 400 }
          );
        }

        // Reduce stock & increment sales
        product.stock -= item.quantity;
        product.salesCount = (product.salesCount || 0) + item.quantity;
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
      // Generate order number: ORD-YYYYMMDD-XXXXXX
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const orderNumber = `ORD-${dateStr}-${randomNum}`;

      const order = new Order({
        orderNumber,
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
        statusHistory: [{
          status: 'pending',
          timestamp: new Date(),
          note: 'Order created',
        }]
      });

      await order.save({ session });

      // Award Loyalty Points for Order (50 points)
      try {
        const customer = await Customer.findOne({ userId: user.id }).session(session);
        if (customer) {
          customer.loyaltyPoints = (customer.loyaltyPoints || 0) + 50;
          await customer.save({ session });
        }
      } catch (lpError) {
        console.error("Error awarding loyalty points for order:", lpError);
        // Non-critical, continue
      }

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

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

      // Check if it's a WriteConflict error (code 112) and retry
      if (error.code === 112 && retryCount < maxRetries - 1) {
        retryCount++;
        const delay = Math.min(100 * Math.pow(2, retryCount), 1000); // Exponential backoff, max 1s
        console.log(`WriteConflict error, retrying (${retryCount}/${maxRetries - 1}) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        session.endSession();
        continue; // Retry the operation
      }

      // If not a WriteConflict or max retries reached, throw the error
      session.endSession();
      console.error('Error creating order:', error);
      return NextResponse.json(
        {
          error: error.code === 112
            ? 'Order creation is temporarily unavailable due to high traffic. Please try again in a moment.'
            : 'Failed to create order. Please try again.'
        },
        { status: 500 }
      );
    } finally {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
    }
  }

  // If we've exhausted all retries
  return NextResponse.json(
    { error: 'Failed to create order after multiple attempts. Please try again.' },
    { status: 500 }
  );
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
      .select('orderNumber items subtotal discount shippingCost tax total status payment.status createdAt delivery.estimatedDelivery reviewStatus')
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
