import mongoose from "mongoose";

const referralLogSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // The user who owns the code
        required: true,
    },
    visitorIp: {
        type: String,
        required: true,
    },
    visitorUserAgent: {
        type: String,
    },
    referralCode: {
        type: String,
        required: true,
    },
    clickedAt: {
        type: Date,
        default: Date.now,
        expires: '24h' // Auto-delete logs after 24 hours to re-enable claiming reward? 
        // Or keep them for analytics?
        // Given the requirement "24-hour cooldown", expiring them effectively resets the cooldown.
    }
});

// Compound index to ensure unique clicks per IP per referrer/code within the expiry window
referralLogSchema.index({ referrer: 1, visitorIp: 1 }, { unique: true });

const ReferralLog = mongoose.models.ReferralLog || mongoose.model("ReferralLog", referralLogSchema);

export default ReferralLog;
