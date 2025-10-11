import nodemailer from 'nodemailer';

// Create transporter - you'll need to configure this with your email service
const createTransporter = () => {
  return nodemailer.createTransport({
    // Configure based on your email service (Gmail, SendGrid, etc.)
    service: 'gmail', // or your preferred service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your app password or API key
    },
  });
};

export const sendBrandInvitationEmail = async (email, brandName, invitationToken) => {
  try {
    const transporter = createTransporter();
    
    const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/brand-onboarding?token=${invitationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
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
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${invitationLink}">${invitationLink}</a>
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendEmailVerificationEmail = async (email, userName, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
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
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationLink}">${verificationLink}</a>
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};