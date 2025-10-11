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
}, { timestamps: true })

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema)

export default Customer