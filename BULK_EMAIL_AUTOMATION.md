# Bulk Email Automation - Implementation Plan

## Feature Overview

Create a comprehensive bulk email automation system that allows users to connect their Google Accounts, upload contact lists, create email templates, and run targeted email campaigns. This feature will help users engage with their leads and customers through automated email marketing.

**Business Value**: Enables users to send targeted email campaigns to their leads, improving customer engagement and conversion rates. Provides marketing automation capabilities directly within the platform.

**Target Users**: Digital marketing agencies, sales teams, e-commerce businesses, and any user looking to automate their email marketing.

## Feature Architecture

### Core Components

1. **Google Account Integration** - OAuth 2.0 authentication for Gmail
2. **Contact Management** - Upload and manage contact lists
3. **Email Templates** - Create and manage email templates
4. **Campaign Management** - Create, send, and track email campaigns
5. **Analytics & Reporting** - Track campaign performance
6. **Frontend Dashboard** - User interface for all email automation features

### Progress Update (February 13, 2026)

#### Completed Tasks

- ✅ **Email Automation Sidebar Dropdown**: Updated the main dashboard sidebar to include a collapsible email automation dropdown with sub-tabs for Overview, Accounts, Contacts, Templates, Campaigns, and History.
- ✅ **Sub-page Routing**: Updated the `renderContent()` function to handle the new email automation sub-sections and render the appropriate components.
- ✅ **Component Imports**: Added imports for all email automation sub-page components.
- ✅ **Google Authentication Fix**: Fixed the Google OAuth integration to ensure refresh tokens are always retrieved by adding `accessType: 'offline'` and `prompt: 'consent'` to the GoogleStrategy configuration. Made refreshToken field optional in the schema to handle cases where Google might not return a refresh token.
- ✅ **Contact List Deletion Fix**: Fixed the issue where deleting a contact list wasn't deleting the corresponding individual contacts. Changed the `deleteContactList` method in `ContactListsService` to use `deleteMany` instead of `updateMany` for associated contacts, ensuring both the list and its contacts are permanently removed.

#### Current Status

The email automation feature is now accessible from the main dashboard sidebar. The dropdown menu expands to show all sub-tabs, and each tab renders the corresponding page. The Google authentication issue has been fixed, and the integration is now working properly. The contact list deletion functionality has been fixed to ensure data consistency.

**Key Fix Details**:

- Updated GoogleStrategy to always request refresh tokens with `accessType: 'offline'`
- Added `prompt: 'consent'` to force the consent screen to appear and ensure refresh token retrieval
- Made refreshToken field optional in the GoogleAccount schema to handle edge cases
- Fixed contact list deletion to delete associated contacts permanently using `deleteMany` instead of just unsetting the contactListId

The sub-pages include:

- **Overview**: Displays email automation statistics and recent campaigns
- **Accounts**: Manages Google Account integration
- **Contacts**: Manages contact lists and CSV upload
- **Templates**: Manages email templates
- **Campaigns**: Manages email campaigns
- **History**: Tracks email sending history

## Implementation Timeline

**Total Estimated Time**: 2-3 weeks

## Phase 1: Google Account Integration (3 days)

### 1.1 Backend Authentication Setup

```typescript
// backend/src/auth/google-auth.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      scope: ["email", "profile", "https://www.googleapis.com/auth/gmail.send"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
```

### 1.2 Google Auth Controller

```typescript
// backend/src/auth/google-auth.controller.ts
import { Controller, Get, UseGuards, Request, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class GoogleAuthController {
  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {
    // This will redirect to Google login
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Request() req, @Query("state") state: string) {
    // Handle Google callback
    const { user } = req;
    // Store user credentials in database
    // Redirect to frontend with success message
    return {
      success: true,
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }
}
```

### 1.3 Google Account Management

```typescript
// backend/src/email/google-account.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GoogleAccount, GoogleAccountDocument } from "./google-account.schema";

@Injectable()
export class GoogleAccountService {
  constructor(
    @InjectModel(GoogleAccount.name)
    private googleAccountModel: Model<GoogleAccountDocument>,
  ) {}

  async connect(userId: string, googleData: any): Promise<GoogleAccount> {
    const existing = await this.googleAccountModel.findOne({ userId });
    if (existing) {
      return this.googleAccountModel.findByIdAndUpdate(
        existing._id,
        {
          accessToken: googleData.accessToken,
          refreshToken: googleData.refreshToken,
          email: googleData.email,
          name: googleData.name,
          picture: googleData.picture,
        },
        { new: true },
      );
    }
    const newAccount = new this.googleAccountModel({
      userId,
      email: googleData.email,
      name: googleData.name,
      picture: googleData.picture,
      accessToken: googleData.accessToken,
      refreshToken: googleData.refreshToken,
    });
    return newAccount.save();
  }

  async disconnect(userId: string): Promise<void> {
    await this.googleAccountModel.deleteOne({ userId });
  }

  async getByUserId(userId: string): Promise<GoogleAccount | null> {
    return this.googleAccountModel.findOne({ userId });
  }
}
```

## Phase 2: Contacts Management (2 days)

### 2.1 Contacts Schema

```typescript
// backend/src/email/contacts.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Contact {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  name?: string;

  @Prop()
  company?: string;

  @Prop()
  phone?: string;

  @Prop({ type: Object })
  customFields?: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export type ContactDocument = Contact & Document;
export const ContactSchema = SchemaFactory.createForClass(Contact);
```

### 2.2 Contacts Service

```typescript
// backend/src/email/contacts.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Contact, ContactDocument } from "./contacts.schema";

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
  ) {}

  async createContact(userId: string, data: any): Promise<Contact> {
    const contact = new this.contactModel({
      userId,
      ...data,
    });
    return contact.save();
  }

  async uploadContacts(userId: string, contacts: any[]): Promise<any> {
    const validContacts = contacts.filter(
      (contact) => contact.email && contact.email.includes("@"),
    );

    const contactsToCreate = validContacts.map((contact) => ({
      userId,
      ...contact,
    }));

    const result = await this.contactModel.insertMany(contactsToCreate);
    return {
      total: contacts.length,
      valid: validContacts.length,
      saved: result.length,
      errors: contacts.length - validContacts.length,
    };
  }

  async getContacts(userId: string, filters: any): Promise<any[]> {
    return this.contactModel.find({ userId, ...filters });
  }

  async deleteContact(userId: string, contactId: string): Promise<void> {
    await this.contactModel.deleteOne({ _id: contactId, userId });
  }
}
```

## Phase 3: Email Templates (3 days)

### 3.1 Templates Schema

```typescript
// backend/src/email/templates.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class EmailTemplate {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: "basic" })
  type: string;

  @Prop({ type: Object })
  variables?: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export type EmailTemplateDocument = EmailTemplate & Document;
export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
```

### 3.2 Templates Service

```typescript
// backend/src/email/templates.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EmailTemplate, EmailTemplateDocument } from "./templates.schema";

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectModel(EmailTemplate.name)
    private templateModel: Model<EmailTemplateDocument>,
  ) {}

  async createTemplate(userId: string, data: any): Promise<EmailTemplate> {
    const template = new this.templateModel({
      userId,
      ...data,
    });
    return template.save();
  }

  async getTemplates(userId: string): Promise<EmailTemplate[]> {
    return this.templateModel.find({ userId, isActive: true });
  }

  async getTemplate(
    userId: string,
    templateId: string,
  ): Promise<EmailTemplate> {
    return this.templateModel.findOne({ _id: templateId, userId });
  }

  async updateTemplate(
    userId: string,
    templateId: string,
    data: any,
  ): Promise<EmailTemplate> {
    return this.templateModel.findByIdAndUpdate(
      templateId,
      { ...data },
      { new: true },
    );
  }

  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    await this.templateModel.deleteOne({ _id: templateId, userId });
  }
}
```

## Phase 4: Campaign Management (4 days)

### 4.1 Campaign Schema

```typescript
// backend/src/email/campaigns.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export enum CampaignStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  RUNNING = "running",
  COMPLETED = "completed",
  PAUSED = "paused",
}

@Schema({ timestamps: true })
export class EmailCampaign {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  templateId?: string;

  @Prop({ required: true })
  contactIds: string[];

  @Prop({ default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Prop()
  scheduledAt?: Date;

  @Prop({ type: Object })
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

export type EmailCampaignDocument = EmailCampaign & Document;
export const EmailCampaignSchema = SchemaFactory.createForClass(EmailCampaign);
```

### 4.2 Campaigns Service

```typescript
// backend/src/email/campaigns.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  EmailCampaign,
  EmailCampaignDocument,
  CampaignStatus,
} from "./campaigns.schema";

@Injectable()
export class EmailCampaignsService {
  constructor(
    @InjectModel(EmailCampaign.name)
    private campaignModel: Model<EmailCampaignDocument>,
  ) {}

  async createCampaign(userId: string, data: any): Promise<EmailCampaign> {
    const campaign = new this.campaignModel({
      userId,
      ...data,
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    });
    return campaign.save();
  }

  async getCampaigns(userId: string): Promise<EmailCampaign[]> {
    return this.campaignModel.find({ userId });
  }

  async getCampaign(
    userId: string,
    campaignId: string,
  ): Promise<EmailCampaign> {
    return this.campaignModel.findOne({ _id: campaignId, userId });
  }

  async updateCampaign(
    userId: string,
    campaignId: string,
    data: any,
  ): Promise<EmailCampaign> {
    return this.campaignModel.findByIdAndUpdate(
      campaignId,
      { ...data },
      { new: true },
    );
  }

  async deleteCampaign(userId: string, campaignId: string): Promise<void> {
    await this.campaignModel.deleteOne({ _id: campaignId, userId });
  }

  async sendCampaign(userId: string, campaignId: string): Promise<void> {
    const campaign = await this.getCampaign(userId, campaignId);
    campaign.status = CampaignStatus.RUNNING;
    await campaign.save();

    // Queue email sending
  }
}
```

## Phase 5: Email Sending Service (3 days)

### 5.1 Gmail Integration

```typescript
// backend/src/email/gmail.service.ts
import { Injectable } from "@nestjs/common";
import { google } from "googleapis";
import { GoogleAccountService } from "./google-account.service";

@Injectable()
export class GmailService {
  private oauth2Client: any;

  constructor(private readonly googleAccountService: GoogleAccountService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:5000/auth/google/callback",
    );
  }

  async sendEmail(
    userId: string,
    to: string,
    subject: string,
    content: string,
  ): Promise<boolean> {
    const account = await this.googleAccountService.getByUserId(userId);

    if (!account) {
      throw new Error("Google account not connected");
    }

    this.oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    });

    const gmail = google.gmail({ version: "v1", auth: this.oauth2Client });

    const emailContent = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      content,
    ].join("\n");

    const encodedMessage = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    try {
      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }
}
```

### 5.2 Email Queue Processor

```typescript
// backend/src/email/email.processor.ts
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { GmailService } from "./gmail.service";

@Processor("email-queue")
export class EmailProcessor {
  constructor(private readonly gmailService: GmailService) {}

  @Process("send-email")
  async handleSendEmail(job: Job): Promise<void> {
    const { userId, to, subject, content } = job.data;

    try {
      await this.gmailService.sendEmail(userId, to, subject, content);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }
}
```

## Phase 6: Frontend Dashboard (5 days)

### 6.1 Dashboard Sidebar Integration

```tsx
// frontend/app/dashboard/email-automation/sidebar-menu.tsx
import { useState } from "react";
import Link from "next/link";

export default function EmailAutomationSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      title: "Overview",
      href: "/dashboard/email-automation/overview",
      icon: "📊",
    },
    {
      title: "Accounts",
      href: "/dashboard/email-automation/accounts",
      icon: "🔗",
    },
    {
      title: "Uploads",
      href: "/dashboard/email-automation/uploads",
      icon: "📤",
    },
    {
      title: "Templates",
      href: "/dashboard/email-automation/templates",
      icon: "📝",
    },
    {
      title: "Campaigns",
      href: "/dashboard/email-automation/campaigns",
      icon: "📧",
    },
    {
      title: "History",
      href: "/dashboard/email-automation/history",
      icon: "📜",
    },
  ];

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <span className="flex items-center">📧 Email Automation</span>
        <span
          className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="ml-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="flex items-center">
                <span className="mr-2">{item.icon}</span>
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 6.2 Accounts Page

```tsx
// frontend/app/dashboard/email-automation/accounts/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function EmailAccountsPage() {
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: googleAccount, refetch } = useQuery({
    queryKey: ["googleAccount"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/email/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await axios.get("http://localhost:5000/auth/google", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Error connecting Google account:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await axios.delete("http://localhost:5000/email/accounts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      refetch();
    } catch (error) {
      console.error("Error disconnecting Google account:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email Accounts</h1>
      </div>

      {googleAccount ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <img
              src={googleAccount.picture}
              alt={googleAccount.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold">{googleAccount.name}</h3>
              <p className="text-gray-600">{googleAccount.email}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Disconnect Account
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold mb-2">
              Connect Google Account
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your Google Account to send email campaigns
            </p>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
            >
              {isConnecting ? "Connecting..." : "Connect Google Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Phase 7: Testing and Optimization (2 days)

### 7.1 Unit Testing

- Backend service tests
- Email sending integration tests
- Frontend component tests

### 7.2 Performance Optimization

- Email queue processing optimization
- Frontend loading and rendering improvements
- Caching strategies for frequent operations

## Database Models Summary

### GoogleAccount

- Stores Google OAuth credentials
- Tracks user's email, name, and picture
- Manages access and refresh tokens

### Contact

- Stores contact information
- Supports custom fields
- Tracks email validity and activity status

### EmailTemplate

- Stores email templates with variables
- Supports HTML content
- Tracks template usage statistics

### EmailCampaign

- Manages email campaigns
- Tracks campaign status and statistics
- Manages contact lists and content

## API Endpoints Summary

### Authentication

- `GET /auth/google` - Redirect to Google login
- `GET /auth/google/callback` - Google OAuth callback

### Email Accounts

- `GET /email/accounts` - Get connected accounts
- `DELETE /email/accounts` - Disconnect Google account

### Contacts

- `POST /email/contacts` - Create single contact
- `POST /email/contacts/upload` - Bulk upload contacts
- `GET /email/contacts` - Get user's contacts
- `DELETE /email/contacts/:id` - Delete contact

### Templates

- `POST /email/templates` - Create template
- `GET /email/templates` - Get templates
- `GET /email/templates/:id` - Get template details
- `PUT /email/templates/:id` - Update template
- `DELETE /email/templates/:id` - Delete template

### Campaigns

- `POST /email/campaigns` - Create campaign
- `GET /email/campaigns` - Get campaigns
- `GET /email/campaigns/:id` - Get campaign details
- `PUT /email/campaigns/:id` - Update campaign
- `DELETE /email/campaigns/:id` - Delete campaign
- `POST /email/campaigns/:id/send` - Send campaign

## Conclusion

This implementation plan outlines a complete bulk email automation system that integrates seamlessly with the existing NexaVelosAI platform. The feature follows the existing architecture patterns with NestJS backend, MongoDB database, and Next.js frontend. The implementation includes all necessary components for managing contacts, creating templates, running campaigns, and tracking performance - all with Google Account integration.
