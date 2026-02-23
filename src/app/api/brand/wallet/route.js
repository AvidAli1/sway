import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Order from '@/app/models/orderModel';
import Brand from '@/app/models/brandModel';
import Payout from '@/app/models/payoutModel';
import { authMiddleware } from '@/utils/authMiddleware';

export async function GET(request) {
    try {
        await connectToDatabase();

        const authResult = await authMiddleware(request);
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { user } = authResult;
        if (user.role !== 'brand') {
            return NextResponse.json({ error: 'Access denied. Brand role required.' }, { status: 403 });
        }

        const brand = await Brand.findOne({ owner: user.id });
        if (!brand) {
            return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const dateFilter = searchParams.get('dateFilter') || 'all'; // 'today', '7days', '30days', 'all'

        let dateQuery = {};
        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate = new Date();
            if (dateFilter === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (dateFilter === '7days') {
                startDate.setDate(now.getDate() - 7);
            } else if (dateFilter === '30days') {
                startDate.setDate(now.getDate() - 30);
            }
            dateQuery = { createdAt: { $gte: startDate, $lte: now } };
        }

        const query = {
            'items.productSnapshot.brand.businessEmail': brand.businessEmail,
            ...dateQuery
        };

        const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

        const COMMISSION_RATE = 0.02; // 2%

        let totalGMV = 0;
        let totalCommission = 0;
        let ledger = [];

        orders.forEach(order => {
            // Find items belonging to this brand
            const brandItems = order.items.filter(
                item => item.productSnapshot.brand.businessEmail === brand.businessEmail
            );

            brandItems.forEach(item => {
                const itemTotal = item.price * item.quantity;
                const itemCommission = itemTotal * COMMISSION_RATE;
                let finalNet = itemTotal - itemCommission;

                const isRefunded = order.status === 'returned' || order.status === 'refunded' || order.status === 'cancelled';
                if (isRefunded) {
                    finalNet = 0;
                }

                // Add to GMV only if not strictly cancelled early stringently, or let's count for "Delivered" specifically for actual Earnings.
                if (order.status === 'delivered') {
                    totalGMV += itemTotal;
                    totalCommission += itemCommission;
                }

                ledger.push({
                    id: order.orderNumber + '-' + item._id, // unique key
                    orderId: order.orderNumber,
                    product: item.productSnapshot.name,
                    sellingPrice: itemTotal,
                    commission: itemCommission,
                    net: finalNet,
                    status: order.status,
                    date: order.createdAt
                });
            });
        });

        const netEarnings = totalGMV - totalCommission;

        // Fetch payouts
        const payouts = await Payout.find({ brand: brand._id });
        const paidOutAmount = payouts
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);

        const pendingPayouts = netEarnings - paidOutAmount;

        return NextResponse.json({
            success: true,
            wallet: {
                totalGMV,
                commissionPaid: totalCommission,
                netEarnings,
                pendingPayouts: Math.max(0, pendingPayouts),
                paidOutAmount,
                commissionRate: COMMISSION_RATE
            },
            ledger
        });

    } catch (error) {
        console.error('Error fetching brand wallet:', error);
        return NextResponse.json({ error: 'Failed to fetch wallet contents' }, { status: 500 });
    }
}
