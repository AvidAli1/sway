import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/app/models/userModel';
import Customer from '@/app/models/customerModel';
import Brand from '@/app/models/brandModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check email verification for customers
    console.log('User verification status:', {
      userId: user._id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      emailVerifiedAt: user.emailVerifiedAt
    });

    // Handle existing users without verification fields (treat as verified for backward compatibility)
    const isEmailVerified = user.isEmailVerified !== undefined ? user.isEmailVerified : true;

    if (user.role === 'customer' && !isEmailVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email before logging in',
          emailNotVerified: true,
          email: user.email
        },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    };

    // Add role-specific data
    if (user.role === 'customer') {
      const customer = await Customer.findOne({ userId: user._id });
      if (customer) {
        responseData.customer = {
          id: customer._id,
          DOB: customer.DOB,
          gender: customer.gender,
          newsletterOptIn: customer.newsletterOptIn,
          stylePreferences: customer.stylePreferences,
          size: customer.size,
          addresses: customer.addresses || [],
        };
      }
    } else if (user.role === 'brand') {
      const brand = await Brand.findOne({ owner: user._id });
      if (brand) {
        responseData.brand = {
          id: brand._id,
          name: brand.name,
          description: brand.description,
          logo: brand.logo,
          bannerImage: brand.bannerImage,
          businessEmail: brand.businessEmail,
          phone: brand.phone,
          verified: brand.verified,
          status: brand.status,
          address: brand.address,
        };
      }
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in login route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
