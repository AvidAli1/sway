import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/dbConnect';
import InvitationToken from '@/app/models/invitationTokenModel';

export async function POST(request) {
  try {
    await connectToDatabase();

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find the invitation token
    const invitation = await InvitationToken.findOne({ token });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check if token is valid and not expired
    if (!invitation.isValid()) {
      return NextResponse.json(
        { error: 'Invitation token has expired or been used' },
        { status: 410 }
      );
    }

    console.log('Returning validation data:', {
      valid: true,
      email: invitation.email,
      brandName: invitation.brandName,
      expiresAt: invitation.expiresAt,
    });

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      brandName: invitation.brandName,
      expiresAt: invitation.expiresAt,
    });

  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
