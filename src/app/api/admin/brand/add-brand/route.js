import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import InvitationToken from '@/app/models/invitationTokenModel';
import { sendBrandInvitationEmail } from '@/utils/emailService';

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, brandName } = await request.json();

    // Validate input
    if (!email || !brandName) {
      return NextResponse.json(
        { error: 'Email and brand name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await InvitationToken.findOne({
      email: email.toLowerCase(),
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email address' },
        { status: 409 }
      );
    }

    // Generate invitation token
    const token = InvitationToken.generateToken();

    // Create invitation record
    const invitation = new InvitationToken({
      token,
      email: email.toLowerCase(),
      brandName,
    });

    await invitation.save();

    // Send invitation email
    const emailResult = await sendBrandInvitationEmail(email, brandName, token);

    if (!emailResult.success) {
      // If email fails, delete the invitation token
      await InvitationToken.findByIdAndDelete(invitation._id);
      return NextResponse.json(
        { error: 'Failed to send invitation email', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Brand invitation sent successfully',
      invitationId: invitation._id,
    });

  } catch (error) {
    console.error('Error in add-brand route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
