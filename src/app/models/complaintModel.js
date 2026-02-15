import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["Website", "Order", "Other"],
            required: true,
        },
        subject: {
            type: String,
            required: [true, "Please provide a subject for your complaint"],
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            required: [true, "Please provide a description"],
            trim: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        images: [{
            type: String, // URLs to images
        }],
        status: {
            type: String,
            enum: ["Open", "In Progress", "Resolved", "Closed"],
            default: "Open",
        },
        adminNotes: {
            type: String,
            trim: true,
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Admin user who resolved it
        },
        resolvedAt: {
            type: Date,
        }
    },
    { timestamps: true }
);

const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);

export default Complaint;
