import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Brand from '@/app/models/brandModel';
import Product from '@/app/models/productModel';

// GET /api/customer/brands - Get brands with active products and pagination
export async function GET(request) {
    try {
        await connectToDatabase();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12; // Grid layout default

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Optional: Only return brands that have at least one active, in-stock product
        const onlyWithProductsStr = searchParams.get('onlyWithProducts');
        const onlyWithProducts = onlyWithProductsStr !== 'false';
        console.log('onlyWithProductsStr:', onlyWithProductsStr, 'evaluates to:', onlyWithProducts);

        let matchStage = { status: 'active' };

        if (onlyWithProducts) {
            // Find distinct brand IDs that have active products
            const brandIdsWithActiveProducts = await Product.distinct('brand', {
                status: 'active',
                inStock: true
            });
            matchStage._id = { $in: brandIdsWithActiveProducts };
        }

        // Get total count for pagination
        const totalBrands = await Brand.countDocuments(matchStage);
        const totalPages = Math.ceil(totalBrands / limit);

        // Calculate pagination info
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        // Fetch the brands
        const brands = await Brand.find(matchStage)
            .select('_id name description logo bannerImage')
            .sort({ name: 1 }) // sort alphabetically
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            success: true,
            brands,
            pagination: {
                currentPage: page,
                totalPages,
                totalBrands,
                hasNextPage,
                hasPrevPage,
                limit
            }
        });

    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
