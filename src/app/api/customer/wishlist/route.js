import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Customer from '@/app/models/customerModel';
import Product from '@/app/models/productModel'; // Ensure Product model is registered

export async function GET(request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const customer = await Customer.findOne({ userId }).populate('wishlist');

        if (!customer) {
            return NextResponse.json({ wishlist: [] });
        }

        return NextResponse.json({ wishlist: customer.wishlist || [] });

    } catch (error) {
        console.error('Wishlist fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { userId, productId } = body;

        if (!userId || !productId) {
            return NextResponse.json({ error: 'Missing userId or productId' }, { status: 400 });
        }

        let customer = await Customer.findOne({ userId });

        if (!customer) {
            // If customer profile doesn't exist yet, create it? 
            // Typically created on signup, but let's be safe.
            customer = await Customer.create({ userId, wishlist: [] });
        }

        const wishlistSet = new Set(customer.wishlist.map(id => id.toString()));
        let action = '';

        if (wishlistSet.has(productId)) {
            // Remove
            customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
            action = 'removed';
        } else {
            // Add
            customer.wishlist.push(productId);
            action = 'added';
        }

        await customer.save();

        return NextResponse.json({ success: true, action, wishlist: customer.wishlist });

    } catch (error) {
        console.error('Wishlist update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
