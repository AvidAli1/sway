import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Review from '@/app/models/reviewModel';
import Product from '@/app/models/productModel';
import Order from '@/app/models/orderModel';
import User from '@/app/models/userModel';
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const productId = searchParams.get('productId');

        let query = {};
        if (userId) {
            query.user = userId;
        } else if (productId) {
            query.product = productId;
            query.status = 'active';
        } else {
            return NextResponse.json({ error: 'User ID or Product ID required' }, { status: 400 });
        }

        const reviews = await Review.find(query)
            .populate('product', 'name thumbnail slug brand')
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, reviews });

    } catch (error) {
        console.error('Reviews fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { userId, productId, rating, comment, orderId, images } = body;

        if (!userId || !productId || !rating || !comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Upsert review
        const review = await Review.findOneAndUpdate(
            { user: userId, product: productId },
            {
                user: userId,
                product: productId,
                rating,
                comment,
                images: images || [],
                order: orderId || undefined,
                status: 'active'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (orderId) {
            await Order.findByIdAndUpdate(orderId, { reviewStatus: 'reviewed' });
        }

        // Update Product stats
        const stats = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), status: 'active' } },
            { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                ratings: stats[0].avgRating,
                numReviews: stats[0].numReviews
            });
        }

        return NextResponse.json({ success: true, review });

    } catch (error) {
        console.error('Review post error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
