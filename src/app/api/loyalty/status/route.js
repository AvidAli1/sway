import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/dbConnect";
import Customer from "@/app/models/customerModel";
import { authMiddleware } from "@/utils/authMiddleware";

export async function GET(request) {
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

        // Ensure referral code exists (generate if missing)
        if (!customer.referralCode) {
            customer.referralCode = 'SWAY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            await customer.save();
        }

        return NextResponse.json({
            success: true,
            loyaltyPoints: customer.loyaltyPoints || 0,
            lastDailyCheckIn: customer.lastDailyCheckIn,
            lastWeeklyClaim: customer.lastWeeklyClaim,
            referralCode: customer.referralCode
        });

    } catch (error) {
        console.error("Error fetching loyalty status:", error);
        return NextResponse.json(
            { error: "Failed to fetch status" },
            { status: 500 }
        );
    }
}
