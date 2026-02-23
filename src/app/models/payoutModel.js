import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
    },
    payoutDate: {
        type: Date,
    },
    referenceId: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true,
});

const Payout = mongoose.models.Payout || mongoose.model("Payout", payoutSchema);

export default Payout;
