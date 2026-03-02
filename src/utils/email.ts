import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create a transporter using SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate a random reset token
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  try {
    const transporter = createTransporter();

    // Create reset URL (you may want to make this configurable)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"D&D Character Sheet" <noreply@yourdomain.com>',
      to: email,
      subject: 'Password Reset Request - D&D Character Sheet',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #8B4513; text-align: center;">D&D Character Sheet</h2>
          <h3 style="color: #333;">Password Reset Request</h3>
          
          <p>Hello,</p>
          
          <p>You requested to reset your password for your D&D Character Sheet account. Click the link below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #8B4513; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
            ${resetUrl}
          </p>
          
          <p><strong>This link will expire in 1 hour.</strong></p>
          
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <hr style="border: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            This is an automated message from D&D Character Sheet. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email: string, username: string): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"D&D Character Sheet" <noreply@yourdomain.com>',
      to: email,
      subject: 'Welcome to D&D Character Sheet!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #8B4513; text-align: center;">D&D Character Sheet</h2>
          <h3 style="color: #333;">Welcome, ${username}!</h3>
          
          <p>Welcome to D&D Character Sheet! Your account has been successfully created.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Create and manage your D&D characters</li>
            <li>Track campaigns and adventures</li>
            <li>Store spells, items, and abilities</li>
            <li>Collaborate with your dungeon master and fellow players</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
               style="background-color: #8B4513; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Get Started
            </a>
          </div>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <hr style="border: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #666; font-size: 12px;">
            This is an automated message from D&D Character Sheet. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome emails - it's not critical
  }
};
