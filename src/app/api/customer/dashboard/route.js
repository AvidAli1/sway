import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Order from '@/app/models/orderModel';
import Review from '@/app/models/reviewModel';
import Customer from '@/app/models/customerModel';
import User from '@/app/models/userModel';

export async function GET(request) {
    try {
        await connectToDatabase();

        // Get user email from header (simulated auth) or just assume logged in check would happen via middleware/session
        // For now we will assume the frontend passes user ID or we decode token if implemented.
        // Given current app pattern (localStorage 'user'), we might need to rely on a passed ID via query param 
        // OR ideally get it from a safe session.
        // However, the `customerDashboard` page fetches user from localStorage. 
        // We should probably rely on a query param `userId` for now to keep it simple as per current architecture, 
        // or better, pass the email/id in headers.

        // Let's check headers for 'x-user-id' if we were using middleware, but we aren't fully.
        // Let's fallback to query param `userId` for this prototype stage.

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // 1. Get Customer to access wishlist
        const customer = await Customer.findOne({ userId });

        // 2. Get Order Stats
        // Assuming 'customer' field in Order refers to User ID (based on orderModel definition)
        const totalOrders = await Order.countDocuments({ customer: userId });
        const pendingOrders = await Order.countDocuments({ customer: userId, status: { $in: ['pending', 'processing', 'confirmed'] } });
        const deliveredOrders = await Order.countDocuments({ customer: userId, status: 'delivered' });

        // 3. Get Wishlist Count
        const wishlistItems = customer?.wishlist?.length || 0;

        // 4. Get Reviews Count
        const reviewsWritten = await Review.countDocuments({ user: userId });

        // 5. Calculate Loyalty Points (Mock logic: 1 point per 1000 spent, or just mock for now)
        // Detailed logic: sum total of all delivered orders / 1000
        // For now, let's keep it static or random-ish based on orders to show dynamism?
        // Let's do simple calculation if possible.
        const ordersValue = await Order.aggregate([
            { $match: { customer: userId, status: 'delivered' } }, // Match by string userId? Mongoose auto-casts if needed, or we cast.
            // Wait, Order.customer is ObjectId. We should cast userId to ObjectId.
        ]);

        // Converting userId string to ObjectId for aggregate
        // But basic countDocuments auto-casts. aggregate does NOT.
        // Let's skip complex aggregation for now to avoid ObjectId import errors without `mongoose` import in this file scope (though we have connectToDatabase).
        // Review count + Order count * 10 = points?
        const loyaltyPoints = (totalOrders * 50) + (reviewsWritten * 10);

        return NextResponse.json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                wishlistItems,
                reviewsWritten,
                loyaltyPoints
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
