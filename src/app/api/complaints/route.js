import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/dbConnect";
import Complaint from "@/app/models/complaintModel";
import Order from "@/app/models/orderModel";
import { authMiddleware } from "@/utils/authMiddleware";

// GET /api/complaints - Get logged-in user's complaints
export async function GET(request) {
    try {
        await connectToDatabase();

        // Auth check
        const auth = await authMiddleware(request);
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { user } = auth;

        const complaints = await Complaint.find({ user: user.id })
            .sort({ createdAt: -1 })
            .populate("order", "orderNumber");

        return NextResponse.json({ success: true, complaints });
    } catch (error) {
        console.error("Error fetching complaints:", error);
        return NextResponse.json(
            { error: "Failed to fetch complaints" },
            { status: 500 }
        );
    }
}

// POST /api/complaints - Create a new complaint
export async function POST(request) {
    try {
        await connectToDatabase();

        // Auth check
        const auth = await authMiddleware(request);
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { user } = auth;
        const body = await request.json();

        const { type, subject, description, order, images } = body;

        // Simple Validation
        if (!type || !subject || !description) {
            return NextResponse.json(
                { error: "Please provide all required fields (type, subject, description)" },
                { status: 400 }
            );
        }

        const complaintData = {
            user: user.id,
            type,
            subject,
            description,
            images: images || [],
            status: "Open"
        };

        if (order && type === "Order") {
            // Check if order is ObjectId or String (Order Number)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(order);

            if (isValidObjectId) {
                complaintData.order = order;
            } else {
                // Clean up the order input (remove "Order", "#", whitespace)
                const cleanedOrderNumber = order.replace(/^(Order\s*)?#?/i, '').trim();

                // Try to find by orderNumber
                const orderDoc = await Order.findOne({ orderNumber: cleanedOrderNumber });
                if (orderDoc) {
                    complaintData.order = orderDoc._id;
                } else {
                    return NextResponse.json(
                        { error: `Order not found with number: ${cleanedOrderNumber}` },
                        { status: 404 }
                    );
                }
            }
        }

        const complaint = await Complaint.create(complaintData);

        return NextResponse.json({ success: true, complaint }, { status: 201 });

    } catch (error) {
        console.error("Error creating complaint:", error);
        return NextResponse.json(
            { error: "Failed to create complaint" },
            { status: 500 }
        );
    }
}
