import connectToDatabase from "@/utils/dbConnect"
import User from "@/app/models/userModel"
import Customer from "@/app/models/customerModel"
import EmailVerificationToken from "@/app/models/emailVerificationTokenModel"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { sendEmailVerificationEmail } from "@/utils/emailService"

export async function POST(request) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { name, email, password, phone } = body || {}

    // Validate required fields
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email and password are required" }),
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Email already in use" }), 
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with customer role
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || undefined,
      role: "customer", // Force customer role
    })

    // Create customer profile
    const customer = await Customer.create({
      userId: user._id,
    })

    // Generate email verification token
    const verificationToken = EmailVerificationToken.generateToken();
    
    // Create verification token record
    const verificationRecord = await EmailVerificationToken.create({
      token: verificationToken,
      userId: user._id,
      email: user.email,
    });

    // Send verification email
    const emailResult = await sendEmailVerificationEmail(user.email, user.name, verificationToken);

    if (!emailResult.success) {
      // If email fails, clean up the user and customer records
      await User.findByIdAndDelete(user._id);
      await Customer.findByIdAndDelete(customer._id);
      await EmailVerificationToken.findByIdAndDelete(verificationRecord._id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to send verification email', details: emailResult.error }), 
        { status: 500 }
      );
    }

    const responseData = {
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      email: user.email, // Include email for resend functionality
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      customer: {
        id: customer._id,
        DOB: customer.DOB,
        gender: customer.gender,
        newsletterOptIn: customer.newsletterOptIn,
        stylePreferences: customer.stylePreferences,
        size: customer.size,
        addresses: customer.addresses || [],
      }
    }

    return new Response(JSON.stringify(responseData), { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }), 
      { status: 500 }
    )
  }
}



