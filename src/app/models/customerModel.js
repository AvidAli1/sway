import mongoose from "mongoose"

const customerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    DOB: {
        type: Date,
    },
    gender: {
        type: String,
    },
    addresses: [{
        label: { type: String, default: "Home" },
        fullName: String,
        phone: String,
        street: String,
        apartment: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        isDefault: { type: Boolean, default: false },
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    newsletterOptIn: {
        type: Boolean,
        default: false,
    },
    stylePreferences: [{
        type: String,
    }],
    size: [{
        type: String,
    }],
    // Loyalty System
    loyaltyPoints: {
        type: Number,
        default: 0,
        min: 0,
    },
    lastDailyCheckIn: {
        type: Date,
    },
    lastWeeklyClaim: {
        type: Date,
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined to not conflict
    }
}, { timestamps: true })

// Middleware to generate referral code before save
customerSchema.pre('save', function (next) {
    if (!this.referralCode && !this.isNew) {
        // Generate code if missing on update (logic can be more complex)
        // For now, assume it's set on creation or handled elsewhere
        // Or simple generation:
        this.referralCode = 'SWAY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    if (this.isNew && !this.referralCode) {
        this.referralCode = 'SWAY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema)

export default Customer