import mongoose from "mongoose";
import crypto from "crypto";

const emailVerificationTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
    used: {
        type: Boolean,
        default: false,
    },
    usedAt: {
        type: Date,
    },
}, { timestamps: true });

// Generate a secure random token
emailVerificationTokenSchema.statics.generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
};

// Check if token is valid and not expired
emailVerificationTokenSchema.methods.isValid = function() {
    return !this.used && this.expiresAt > new Date();
};

export default mongoose.models.EmailVerificationToken || mongoose.model("EmailVerificationToken", emailVerificationTokenSchema);
