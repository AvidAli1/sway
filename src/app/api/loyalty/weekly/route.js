import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/dbConnect";
import Customer from "@/app/models/customerModel";
import { authMiddleware } from "@/utils/authMiddleware";

export async function POST(request) {
    try {
        await connectToDatabase();

        const auth = await authMiddleware(request);
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const userId = auth.user.id;
        const customer = await Customer.findOne({ userId });

        if (!customer) {
            return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
        }

        const now = new Date();
        const lastClaim = customer.lastWeeklyClaim ? new Date(customer.lastWeeklyClaim) : null;

        // Check if 7 days have passed
        if (lastClaim) {
            const diffTime = Math.abs(now - lastClaim);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Use < 7 for strict week, usually wait time should be >= 7 days
            // However, diffDays logic might be rounding up 'ceil'.
            // Better: compare timestamps directly.
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

            if ((now - lastClaim) < sevenDaysMs) {
                const daysLeft = Math.ceil((sevenDaysMs - (now - lastClaim)) / (1000 * 60 * 60 * 24));
                return NextResponse.json(
                    { error: `Weekly reward available in ${daysLeft} days.` },
                    { status: 400 }
                );
            }
        }

        // Award 100 RP
        customer.loyaltyPoints += 100;
        customer.lastWeeklyClaim = now;
        await customer.save();

        return NextResponse.json({
            success: true,
            message: "Weekly reward claimed!",
            pointsAdded: 100,
            newBalance: customer.loyaltyPoints,
            lastWeeklyClaim: customer.lastWeeklyClaim
        });

    } catch (error) {
        console.error("Error claiming weekly reward:", error);
        return NextResponse.json(
            { error: "Failed to claim reward" },
            { status: 500 }
        );
    }
}
