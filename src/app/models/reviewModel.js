
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userName: {
            type: String, // Cached for easier display
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order", // To verify verified purchase
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
        images: [String], // Optional URLs for review photos
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
        likes: {
            type: Number,
            default: 0,
        },
        reply: {
            text: { type: String },
            createdAt: { type: Date },
            updatedAt: { type: Date }
        },
        status: {
            type: String,
            enum: ["active", "hidden", "flagged"],
            default: "active",
        },
    },
    { timestamps: true }
);

// Prevent model overwrite in dev/hot reload
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
