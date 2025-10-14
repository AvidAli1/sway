import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Order from '@/app/models/orderModel';
import Brand from '@/app/models/brandModel';
import { authMiddleware } from '@/utils/authMiddleware';

// GET /api/brand/orders - Get orders for brand
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

    // Find the brand
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
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query to find orders containing brand's products
    const query = {
      'items.productSnapshot.brand.businessEmail': brand.businessEmail
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get orders
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter items to only show brand's products
    const filteredOrders = orders.map(order => {
      const brandItems = order.items.filter(
        item => item.productSnapshot.brand.businessEmail === brand.businessEmail
      );
      
      // Recalculate totals for brand's items only
      const brandSubtotal = brandItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        ...order,
        items: brandItems,
        brandSubtotal,
        itemCount: brandItems.length
      };
    });

    // Get total count
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
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
    console.error('Error fetching brand orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
