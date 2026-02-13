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

    this.oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

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
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}
