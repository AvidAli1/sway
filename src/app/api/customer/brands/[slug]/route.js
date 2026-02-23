import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Brand from '@/app/models/brandModel';

// GET /api/customer/brands/[slug] - Get brand details by name or id
export async function GET(request, { params }) {
    try {
        await connectToDatabase();
        const { slug } = await params;

        // In our DB, we don't have a strict 'slug' field on brand, but we have 'name'
        // Let's decode the URI component first since it may come URL encoded (e.g., "North%20Face")
        const brandName = decodeURIComponent(slug);

        // Find the brand by name (case-insensitive regex) or ID if it looks like an ObjectId
        let brand;
        if (brandName.match(/^[0-9a-fA-F]{24}$/)) {
            brand = await Brand.findById(brandName).select('-status -role -permissions');
        } else {
            brand = await Brand.findOne({
                name: { $regex: new RegExp('^' + brandName + '$', 'i') }
            }).select('name description logo bannerImage status _id');
        }

        if (!brand) {
            return NextResponse.json(
                { error: 'Brand not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            brand
        });

    } catch (error) {
        console.error('Error fetching brand:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
