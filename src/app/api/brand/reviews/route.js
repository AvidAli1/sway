import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Review from '@/app/models/reviewModel';
import Product from '@/app/models/productModel';
import Brand from '@/app/models/brandModel';
import { authMiddleware } from '@/utils/authMiddleware';
import User from '@/app/models/userModel'; // Import User to ensure model is registered

export async function GET(request) {
    try {
        await connectToDatabase();
        const auth = await authMiddleware(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        if (auth.user.role !== 'brand') {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const brand = await Brand.findOne({ owner: auth.user.id });
        if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

        // Find all products by this brand
        const products = await Product.find({ brand: brand._id }).select('_id');
        const productIds = products.map(p => p._id);

        // Find reviews for these products
        const reviews = await Review.find({ product: { $in: productIds } })
            .populate('product', 'name thumbnail images')
            .populate('user', 'name avatar gender')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, reviews });

    } catch (error) {
        console.error("Fetch reviews error", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectToDatabase();
        const auth = await authMiddleware(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        if (auth.user.role !== 'brand') {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const body = await request.json();
        const { reviewId, replyText } = body;

        if (!reviewId || !replyText) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const brand = await Brand.findOne({ owner: auth.user.id });
        if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

        const review = await Review.findById(reviewId).populate('product');
        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

        // Verify ownership (product.brand should match)
        if (review.product.brand.toString() !== brand._id.toString()) {
            return NextResponse.json({ error: "Not authorized to reply to this review" }, { status: 403 });
        }

        if (review.reply && review.reply.createdAt) {
            review.reply.text = replyText;
            review.reply.updatedAt = new Date();
        } else {
            review.reply = {
                text: replyText,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }
        await review.save();

        return NextResponse.json({ success: true, review });

    } catch (error) {
        console.error("Reply review error", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await connectToDatabase();
        const auth = await authMiddleware(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        if (auth.user.role !== 'brand') {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const reviewId = searchParams.get('reviewId');

        if (!reviewId) return NextResponse.json({ error: "Missing review ID" }, { status: 400 });

        const brand = await Brand.findOne({ owner: auth.user.id });
        if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

        const review = await Review.findById(reviewId).populate('product');
        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

        if (review.product.brand.toString() !== brand._id.toString()) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        review.reply = undefined;
        await review.save();

        return NextResponse.json({ success: true, review });

    } catch (error) {
        console.error("Delete review reply error", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
