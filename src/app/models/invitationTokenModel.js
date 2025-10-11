import mongoose from "mongoose";
import crypto from "crypto";

const invitationTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    brandName: {
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
invitationTokenSchema.statics.generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
};

// Check if token is valid and not expired
invitationTokenSchema.methods.isValid = function() {
    return !this.used && this.expiresAt > new Date();
};

export default mongoose.models.InvitationToken || mongoose.model("InvitationToken", invitationTokenSchema);
