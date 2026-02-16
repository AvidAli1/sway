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
        const lastCheckIn = customer.lastDailyCheckIn ? new Date(customer.lastDailyCheckIn) : null;

        // Check if already checked in today
        if (lastCheckIn) {
            const isSameDay =
                now.getDate() === lastCheckIn.getDate() &&
                now.getMonth() === lastCheckIn.getMonth() &&
                now.getFullYear() === lastCheckIn.getFullYear();

            if (isSameDay) {
                return NextResponse.json(
                    { error: "You have already claimed your daily reward today!" },
                    { status: 400 }
                );
            }
        }

        // Award 20 RP
        customer.loyaltyPoints += 20;
        customer.lastDailyCheckIn = now;
        await customer.save();

        return NextResponse.json({
            success: true,
            message: "Daily reward claimed!",
            pointsAdded: 20,
            newBalance: customer.loyaltyPoints,
            lastDailyCheckIn: customer.lastDailyCheckIn
        });

    } catch (error) {
        console.error("Error claiming daily reward:", error);
        return NextResponse.json(
            { error: "Failed to claim reward" },
            { status: 500 }
        );
    }
}
