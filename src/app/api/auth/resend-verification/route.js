import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/app/models/userModel';
import EmailVerificationToken from '@/app/models/emailVerificationTokenModel';
import { sendEmailVerificationEmail } from '@/utils/emailService';

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Check if user is a customer (only customers need email verification)
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Email verification is only required for customer accounts' },
        { status: 400 }
      );
    }

    // Delete any existing unused verification tokens for this user
    await EmailVerificationToken.deleteMany({
      userId: user._id,
      used: false
    });

    // Generate new verification token
    const verificationToken = EmailVerificationToken.generateToken();
    
    // Create new verification token record
    const verificationRecord = await EmailVerificationToken.create({
      token: verificationToken,
      userId: user._id,
      email: user.email,
    });

    // Send verification email
    const emailResult = await sendEmailVerificationEmail(user.email, user.name, verificationToken);

    if (!emailResult.success) {
      // If email fails, delete the verification token
      await EmailVerificationToken.findByIdAndDelete(verificationRecord._id);
      
      return NextResponse.json(
        { error: 'Failed to send verification email', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      email: user.email
    });

  } catch (error) {
    console.error('Error in resend verification route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
