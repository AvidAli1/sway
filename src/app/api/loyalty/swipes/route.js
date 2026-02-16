import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/dbConnect";
import Customer from "@/app/models/customerModel";
import { authMiddleware } from "@/utils/authMiddleware";

// POST /api/loyalty/swipes - Record swipes and award points
export async function POST(request) {
    try {
        await connectToDatabase();

        // Auth check
        const auth = await authMiddleware(request);
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { count } = await request.json(); // e.g. { count: 10 } for batching
        const swipeCount = Math.max(1, Math.min(count || 1, 500)); // Clamp between 1 and 500 per request

        const userId = auth.user.id;
        const customer = await Customer.findOne({ userId });

        if (!customer) {
            return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
        }

        // Award 1 point per swipe
        const pointsAwarded = swipeCount;
        customer.loyaltyPoints += pointsAwarded;

        // Optionally track total swipes if needed
        // customer.totalSwipes += swipeCount;

        await customer.save();

        return NextResponse.json({
            success: true,
            pointsAdded: pointsAwarded,
            newBalance: customer.loyaltyPoints
        });

    } catch (error) {
        console.error("Error recording swipes:", error);
        return NextResponse.json(
            { error: "Failed to record swipes" },
            { status: 500 }
        );
    }
}
