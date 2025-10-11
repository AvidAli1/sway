import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/app/models/userModel';

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

    console.log('Current user status:', {
      userId: user._id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      emailVerifiedAt: user.emailVerifiedAt
    });

    // Manually verify the email - handle existing users without these fields
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

    console.log('User manually verified:', {
      userId: updatedUser._id,
      email: updatedUser.email,
      isEmailVerified: updatedUser.isEmailVerified,
      emailVerifiedAt: updatedUser.emailVerifiedAt
    });

    return NextResponse.json({
      success: true,
      message: 'Email manually verified',
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
    console.error('Error in manual verify route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
