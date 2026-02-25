import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleAccountService } from './google-account.service';

@Injectable()
export class GmailService {
  private oauth2Client: any;

  constructor(private readonly googleAccountService: GoogleAccountService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:5000/auth/google/callback',
    );
  }

  async sendEmail(
    userId: string,
    to: string,
    subject: string,
    content: string,
    accountId?: string,
  ): Promise<boolean> {
    let account;

    if (accountId) {
      // If accountId is specified, use that account
      account = await this.googleAccountService.getById(userId, accountId);
    } else {
      // If no accountId specified, use the default account or first available
      const accounts = await this.googleAccountService.getByUserId(userId);
      account = accounts.find((acc) => acc.isDefault) || accounts[0];
    }

    if (!account) {
      throw new Error('Google account not connected');
    }

    // Check if we have both access token and refresh token
    if (!account.accessToken) {
      throw new Error('Google account missing access token');
    }

    if (!account.refreshToken) {
      throw new Error('Google account missing refresh token');
    }

    this.oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    // Attempt to refresh token directly to ensure we have valid credentials
    try {
      console.log('Refreshing access token before sending email...');
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      account.accessToken = credentials.access_token;
      if (credentials.refresh_token) {
        account.refreshToken = credentials.refresh_token;
      }
      await this.googleAccountService.updateAccount(
        userId,
        account._id,
        account,
      );
      console.log('Access token refreshed successfully');
    } catch (refreshError) {
      console.error('Failed to refresh token:', refreshError);
      // Handle invalid refresh token - mark account as inactive
      console.log('Marking account as inactive due to invalid refresh token');
      await this.googleAccountService.updateAccount(userId, account._id, {
        ...account,
        isActive: false,
      });
      throw new Error(
        'Authentication failed. Please reconnect your Google account.',
      );
    }

    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const emailContent = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      content,
    ].join('\n');

    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log(`Email sent successfully to ${to}:`, response.data.id);
      return true;
    } catch (error) {
      console.error('Error sending email:', error.response?.data || error);

      // Handle specific Gmail API errors
      if (error.response?.data?.error?.code === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.response?.data?.error?.code === 401) {
        throw new Error(
          'Authentication failed. Please reconnect your Google account.',
        );
      } else if (error.response?.data?.error?.code === 403) {
        throw new Error(
          'Permission denied. Please check your Google account settings.',
        );
      } else {
        throw new Error(`Failed to send email: ${error.message}`);
      }
    }
  }
}
