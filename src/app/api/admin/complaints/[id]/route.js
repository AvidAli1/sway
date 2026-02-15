import { NextResponse } from "next/server";
import connectToDatabase from "@/utils/dbConnect";
import Complaint from "@/app/models/complaintModel";
import { authMiddleware } from "@/utils/authMiddleware";

// PATCH /api/admin/complaints/[id] - Update complaint status
export async function PATCH(request, { params }) {
    try {
        await connectToDatabase();

        const auth = await authMiddleware(request);
        if (auth.error || auth.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const { status, adminNotes } = await request.json();

        const updateData = {};
        if (status) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

        if (status === 'Resolved' || status === 'Closed') {
            updateData.resolvedBy = auth.user.id;
            updateData.resolvedAt = new Date();
        }

        const complaint = await Complaint.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate("user", "name email");

        if (!complaint) {
            return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, complaint });

    } catch (error) {
        console.error("Error updating complaint:", error);
        return NextResponse.json(
            { error: "Failed to update complaint" },
            { status: 500 }
        );
    }
}

// GET /api/admin/complaints/[id] - Get details
export async function GET(request, { params }) {
    try {
        await connectToDatabase();

        const auth = await authMiddleware(request);
        if (auth.error || auth.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const complaint = await Complaint.findById(id)
            .populate("user", "name email phone")
            .populate("order");

        if (!complaint) {
            return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, complaint });

    } catch (error) {
        console.error("Error fetching complaint:", error);
        return NextResponse.json(
            { error: "Failed to fetch complaint" },
            { status: 500 }
        );
    }
}
