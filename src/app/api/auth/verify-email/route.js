import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/app/models/userModel';
import EmailVerificationToken from '@/app/models/emailVerificationTokenModel';

export async function POST(request) {
  try {
    await connectToDatabase();

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationRecord = await EmailVerificationToken.findOne({ token });

    if (!verificationRecord) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 404 }
      );
    }

    // Check if token is valid and not expired
    if (!verificationRecord.isValid()) {
      return NextResponse.json(
        { error: 'Verification token has expired or been used' },
        { status: 410 }
      );
    }

    // Find the user
    const user = await User.findById(verificationRecord.userId);
    
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

    // Mark email as verified - handle existing users without these fields
    const updateData = {
      isEmailVerified: true,
      emailVerifiedAt: new Date()
    };
    
    // Use findByIdAndUpdate to ensure fields are added
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, upsert: false }
    );

    console.log('Email verification completed:', {
      userId: updatedUser._id,
      email: updatedUser.email,
      isEmailVerified: updatedUser.isEmailVerified,
      emailVerifiedAt: updatedUser.emailVerifiedAt
    });

    // Mark verification token as used
    verificationRecord.used = true;
    verificationRecord.usedAt = new Date();
    await verificationRecord.save();

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isEmailVerified: updatedUser.isEmailVerified,
        emailVerifiedAt: updatedUser.emailVerifiedAt,
      }
    });

  } catch (error) {
    console.error('Error in verify email route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
