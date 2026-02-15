import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/dbConnect";
import Complaint from "@/app/models/complaintModel";
import User from "@/app/models/userModel"; // Ensure User model is registered
import { authMiddleware } from "@/utils/authMiddleware";

// GET /api/admin/complaints - List all complaints for admin
export async function GET(request) {
    try {
        await connectToDatabase();

        // Auth check - simplified for now, ideally check for role='admin'
        // but the implementation plan for admin login uses a special token logic or we can reuse middleware if updated.
        // Assuming authMiddleware returns user with role.
        const auth = await authMiddleware(request);
        if (auth.error) {
            // Special bypass for hardcoded admin if using that strategy, 
            // but ideally the middleware should verify the admin token.
            // For now, let's rely on middleware.
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        // Check if admin
        if (auth.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const type = searchParams.get("type");

        const query = {};
        if (status && status !== "All") query.status = status;
        if (type && type !== "All") query.type = type;

        const complaints = await Complaint.find(query)
            .sort({ createdAt: -1 })
            .populate("user", "name email")
            .populate("order", "orderNumber");

        return NextResponse.json({ success: true, complaints });

    } catch (error) {
        console.error("Error fetching admin complaints:", error);
        return NextResponse.json(
            { error: "Failed to fetch complaints" },
            { status: 500 }
        );
    }
}
