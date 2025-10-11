import mongoose from "mongoose";
import { Princess_Sofia } from "next/font/google";


const productSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
    },
    specifications: [{
        key: {
            type: String,
        },
        value: {
            type: String,
        }
    }],
    description: {
        type: String,
        maxlength: 3000,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    subCategory: {
        type: String,
        trim: true,
    },
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
    features: [
        {
            type: String,
            trim: true,
        },
    ],
    originalPrice: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        default: "PKR",
    },
    discount: {
        type: Number,
        default: 0,
    },
    stock: {
        type: Number,
        default: 0,
    },
    inStock: {
        type: Boolean,
        default: true,
    },
    sizes: [
        {
            type: String,
            trim: true,
        },
    ],
    colors: [
        {
            type: String,
            trim: true,
        },
    ],
    sku: {
        type: String,
        trim: true,
        unique: true,
    },
    images: [
        {
            type: String,
            trim: true,
        },
    ],
    thumbnail: {
        type: String,
        trim: true,
    },
    gender: {
        type: String,
        enum: ["men", "women", "unisex", "kids"],
        default: "unisex",
    },
    material: {
        type: String,
        trim: true,
    },
    fitType: {
        type: String,
        trim: true,
    },
    occasion: {
        type: String,
        trim: true,
    },
    careInstructions: {
        type: String,
        trim: true,
    },
    ratings: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["active", "inactive", "draft"],
        default: "active",
    },
});
