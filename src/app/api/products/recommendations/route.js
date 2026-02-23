import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import Product from '@/app/models/productModel';
import User from '@/app/models/userModel';
import Customer from '@/app/models/customerModel';
import { authMiddleware } from '@/utils/authMiddleware';

function getSeason(date = new Date()) {
    const month = date.getMonth(); // 0-11
    // Simple Northern Hemisphere mapping
    // Winter: 11, 0, 1 (Dec, Jan, Feb)
    // Spring: 2, 3, 4 (Mar, Apr, May)
    // Summer: 5, 6, 7 (Jun, Jul, Aug)
    // Autumn: 8, 9, 10 (Sep, Oct, Nov)

    if (month === 11 || month <= 1) return 'Winter';
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    return 'Autumn';
}

export async function GET(request) {
    try {
        await connectToDatabase();

        // 1. Determine User Context (Auth optional but recommended for personalization)
        const { searchParams } = new URL(request.url);
        const authResult = await authMiddleware(request); // might return error if not logged in, but we want to allow guests too optionally? 
        // The previous authMiddleware seems strict. Let's check if it allows optional auth.
        // Use the auth result if success, otherwise treat as guest.

        let user = null;
        let customer = null;
        if (!authResult.error) {
            user = authResult.user;
            // Fetch customer details for style preferences
            customer = await Customer.findOne({ userId: user.id });
        }

        // 2. Determine Season (Mocking IP-based for now, using server time)
        // In production, use `request.headers.get('x-forwarded-for')` and an IP-geo API
        const currentSeason = getSeason();
        console.log(`Current Season detected: ${currentSeason}`);

        // 3. Build Pipeline
        const pipeline = [];

        // STAGE 1: Vector Search (if customer has embedding)
        // We try to find products that match style, AND invoke filters for season/stock
        if (customer && customer.styleEmbedding && customer.styleEmbedding.length > 0) {
            console.log("Using Vector Search for validation user style");
            pipeline.push({
                $vectorSearch: {
                    index: "vector_index", // User must create this index
                    path: "embedding",
                    queryVector: customer.styleEmbedding,
                    numCandidates: 100, // Search roughly 100 nearest neighbors
                    limit: 50, // Return top 50
                    filter: {
                        $and: [
                            { inStock: true },
                            {
                                $or: [
                                    { season: currentSeason },
                                    { season: "All Seasons" }
                                ]
                            }
                        ]
                    }
                }
            });

            // Project score
            pipeline.push({
                $project: {
                    name: 1,
                    price: 1,
                    images: 1,
                    category: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            });

        } else {
            // Fallback: Standard Match if no style embedding
            console.log("No style embedding found, using standard filter");
            pipeline.push({
                $match: {
                    inStock: true,
                    $or: [
                        { season: currentSeason },
                        { season: "All Seasons" }
                    ]
                }
            });

            // Sort by newness or simplistic random sample
            pipeline.push({ $sort: { createdAt: -1 } });
            pipeline.push({ $limit: 20 });
        }

        const products = await Product.aggregate(pipeline);

        return NextResponse.json({
            success: true,
            season: currentSeason,
            source: customer && customer.styleEmbedding && customer.styleEmbedding.length > 0 ? "vector_search" : "standard_filter",
            products
        });

    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
