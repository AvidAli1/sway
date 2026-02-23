// Connection helper to avoid re-connecting in Next.js hot reloads
import mongoose from "mongoose"

// Define User schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "brand", "admin"],
      default: "customer",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    avatar: {
      type: String, // URL
    },
    stylePreferences: {
      type: [String], // e.g., ["streetwear", "minimalist"]
      default: [],
    },
    styleEmbedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
)

// Prevent model overwrite in dev/hot reload
const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User