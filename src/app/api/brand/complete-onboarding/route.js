import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import InvitationToken from '@/app/models/invitationTokenModel';
import Brand from '@/app/models/brandModel';
import User from '@/app/models/userModel';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectToDatabase();

    const {
      token,
      // User data
      name,
      email,
      password,
      phone,
      // Brand data
      brandName,
      description,
      businessEmail,
      brandPhone,
      address,
      city,
      state,
      postalCode,
      logo,
      bannerImage,
    } = await request.json();

    // Validate required fields
    if (!token || !name || !email || !password || !brandName || !businessEmail) {
      return NextResponse.json(
        { error: 'Token, name, email, password, brand name, and business email are required' },
        { status: 400 }
      );
    }

    // Find and validate the invitation token
    const invitation = await InvitationToken.findOne({ token });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    if (!invitation.isValid()) {
      return NextResponse.json(
        { error: 'Invitation token has expired or been used' },
        { status: 410 }
      );
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Check if brand already exists with this business email
    const existingBrand = await Brand.findOne({ businessEmail: businessEmail.toLowerCase() });
    if (existingBrand) {
      return NextResponse.json(
        { error: 'A brand with this business email already exists' },
        { status: 409 }
      );
    }

    // Create a user account for the brand owner
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: 'brand',
    });

    await user.save();

    // Create the brand
    const brand = new Brand({
      name: brandName,
      description,
      businessEmail: businessEmail.toLowerCase(),
      phone: brandPhone,
      logo,
      bannerImage,
      verified: true, // Auto-verify invited brands
      status: 'active',
      address: {
        address,
        city,
        state,
        postalCode,
      },
      owner: user._id,
    });

    await brand.save();

    // Mark invitation as used
    invitation.used = true;
    invitation.usedAt = new Date();
    await invitation.save();

    return NextResponse.json({
      success: true,
      message: 'Brand onboarding completed successfully',
      brandId: brand._id,
      userId: user._id,
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
