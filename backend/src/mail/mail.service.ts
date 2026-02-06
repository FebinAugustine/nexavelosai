import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    // Verify transporter connection
    this.transporter.verify().catch((error) => {
      this.logger.warn('SMTP connection verification failed:', error.message);
    });
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email - NexaVelosAI',
      html: `
        <h1>Welcome to NexaVelosAI!</h1>
        <p>Please verify your email address by entering the following code:</p>
        <h2>${code}</h2>
        <p>This code will expire in 24 hours.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}:`,
        error.message,
      );
      // Do not rethrow to avoid failing the user registration process
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - NexaVelosAI',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error.message,
      );
      // Do not rethrow to avoid failing the password reset process
    }
  }

  async sendContactEmail(
    name: string,
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.CONTACT_EMAIL || 'support@nexavelosai.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Contact email sent from ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send contact email from ${email}:`,
        error.message,
      );
      throw error; // Rethrow to let the controller handle the error
    }
  }

  async sendTeamInvitationEmail(
    email: string,
    teamName: string,
    inviteLink: string,
    expiresAt: Date,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `You're Invited to Join ${teamName} on NexaVelosAI`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #007bff;">You're Invited!</h1>
          <p>You have been invited to join the <strong>${teamName}</strong> team on NexaVelosAI.</p>
          <p>Click the link below to accept your invitation:</p>
          <p style="text-align: center;">
            <a href="${inviteLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Accept Invitation
            </a>
          </p>
          <p>This invitation will expire on ${expiresAt.toLocaleDateString()} at ${expiresAt.toLocaleTimeString()}.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>Best regards,<br>The NexaVelosAI Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Team invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send team invitation email to ${email}:`,
        error.message,
      );
      // Do not rethrow to avoid failing the invitation process
    }
  }
}
