import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    logo: {
        type: String,
    },
    verified: {
        type: Boolean,
    },
    bannerImage: {
        type: String,
    },
    businessEmail: {
        type: String,
    },
    phone: {
        type: String,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive",
    },
    address: {
        address: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        postalCode: {
            type: String,
        },
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {timestamps: true})

export default mongoose.models.Brand || mongoose.model("Brand", brandSchema)