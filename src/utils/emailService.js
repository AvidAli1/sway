import { Resend } from 'resend';

// Configure Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Send Brand Invitation Email
export const sendBrandInvitationEmail = async (email, brandName, invitationToken) => {
  try {
    const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/brand-onboarding?token=${invitationToken}`;

    // Use a verified domain or "onboarding@resend.dev" for testing without domain verification
    // For testing, "onboarding@resend.dev" works ONLY if sending to the email registered with Resend account
    // For user-entered emails, you MUST verify your domain in Resend.
    // Assuming development mode or verified domain:
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email, // Resend free tier only allows sending to your own email unless domain verified
      subject: `Invitation to Join Sway as ${brandName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Sway!</h2>
          <p>You've been invited to join Sway as a brand partner for <strong>${brandName}</strong>.</p>
          <p>Click the link below to complete your brand onboarding:</p>
          <a href="${invitationLink}" 
             style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Complete Brand Onboarding
          </a>
          <p style="color: #666; font-size: 14px;">
            This invitation link will expire in 24 hours. If you didn't expect this invitation, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending brand email via Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending brand email:', error);
    return { success: false, error: error.message };
  }
};

// Send Email Verification Email
export const sendEmailVerificationEmail = async (email, userName, verificationToken) => {
  try {
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    // Use a verified domain or "onboarding@resend.dev" for testing
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verify Your Email - Sway',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Sway, ${userName}!</h2>
          <p>Thank you for registering with Sway. To complete your registration, please verify your email address.</p>
          <p>Click the link below to verify your email:</p>
          <a href="${verificationLink}" 
             style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email Address
          </a>
          <p style="color: #666; font-size: 14px;">
            This verification link will expire in 24 hours. If you didn't create an account with Sway, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending verification email via Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};