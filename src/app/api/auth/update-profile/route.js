import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/app/models/userModel';
import Customer from '@/app/models/customerModel';
import { authMiddleware } from '@/utils/authMiddleware';

export async function PUT(request) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { 
      // User fields
      name, 
      phone,
      // Customer fields
      DOB,
      gender,
      newsletterOptIn,
      stylePreferences,
      size,
      addresses
    } = body;

    // Update user fields
    const userUpdateData = {};
    if (name !== undefined) userUpdateData.name = name;
    if (phone !== undefined) userUpdateData.phone = phone;

    let updatedUser = null;
    if (Object.keys(userUpdateData).length > 0) {
      updatedUser = await User.findByIdAndUpdate(
        authResult.user.id,
        userUpdateData,
        { new: true }
      );
    }

    // Update customer fields
    const customerUpdateData = {};
    if (DOB !== undefined) customerUpdateData.DOB = DOB;
    if (gender !== undefined) customerUpdateData.gender = gender;
    if (newsletterOptIn !== undefined) customerUpdateData.newsletterOptIn = newsletterOptIn;
    if (stylePreferences !== undefined) customerUpdateData.stylePreferences = stylePreferences;
    if (size !== undefined) customerUpdateData.size = size;
    if (addresses !== undefined) customerUpdateData.addresses = addresses;

    let updatedCustomer = null;
    if (Object.keys(customerUpdateData).length > 0) {
      updatedCustomer = await Customer.findOneAndUpdate(
        { userId: authResult.user.id },
        customerUpdateData,
        { new: true }
      );
    }

    // If no updates were made
    if (!updatedUser && !updatedCustomer) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Get current user and customer data
    const currentUser = updatedUser || await User.findById(authResult.user.id);
    const currentCustomer = updatedCustomer || await Customer.findOne({ userId: authResult.user.id });

    const responseData = {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        role: currentUser.role,
      }
    };

    // Include customer data if user is a customer
    if (currentUser.role === 'customer' && currentCustomer) {
      responseData.customer = {
        id: currentCustomer._id,
        DOB: currentCustomer.DOB,
        gender: currentCustomer.gender,
        newsletterOptIn: currentCustomer.newsletterOptIn,
        stylePreferences: currentCustomer.stylePreferences,
        size: currentCustomer.size,
        addresses: currentCustomer.addresses || [],
      };
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in update profile route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
