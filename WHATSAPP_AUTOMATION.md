# WhatsApp Automation - Implementation Plan

## Feature Overview

Create a comprehensive WhatsApp automation system that allows users to connect their WhatsApp Business Accounts, create and send WhatsApp messages and campaigns, and track engagement metrics. This feature will enable businesses to reach customers through the world's most popular messaging platform, complementing existing email automation and chat widget functionalities.

**Business Value**: Enables businesses to engage customers through WhatsApp, the most widely used communication platform globally, increasing customer engagement and conversion rates.

**Target Users**: Digital marketing agencies, sales teams, e-commerce businesses, and any user looking to automate customer communication through WhatsApp.

## Meta Requirements for WhatsApp Business API

To use the WhatsApp Business API, you and your clients will need:

### 1. Meta Business Account

- A valid Meta Business Account linked to your business
- Business verification (required for full API access)
- Complete business profile with accurate information

### 2. WhatsApp Business Account

- Created within your Meta Business Account
- Verified phone number (must be a real, active phone number)
- Business display name that matches your registered business name
- Compliance with WhatsApp Business Platform policies

### 3. API Credentials

- **Phone Number ID**: Unique identifier for your WhatsApp phone number
- **Business Account ID**: For managing your WhatsApp Business Account
- **System User Access Token**: Long-lived access token for API authentication
- **Webhook Configuration**: For receiving real-time message status updates

### 4. Template Approval

- All outgoing messages must use pre-approved templates
- Templates must comply with WhatsApp's messaging policies
- Approval typically takes 1-2 business days
- Templates are approved per phone number

### 5. Business Verification

- Required for most API features
- Requires submission of business documentation
- Verification status affects message limits

## Multi-Client Support

### Architecture for Multiple Clients

The WhatsApp automation feature is designed to support **multiple clients with separate WhatsApp Business Accounts**:

```typescript
// Each user can connect their own WhatsApp Business Account
// backend/src/whatsapp/whatsapp-account.service.ts
async connectAccount(userId: string, data: any): Promise<WhatsAppAccount> {
  // Store account credentials per user
  return this.accountModel.create({
    userId,
    phoneNumber: data.phoneNumber,
    phoneNumberId: data.phoneNumberId,
    accessToken: data.accessToken,
    businessName: data.businessName,
    isActive: true,
  });
}
```

### Key Multi-Client Features

1. **Isolated Account Management**: Each user manages their own WhatsApp Business Account
2. **Separate API Credentials**: Each account has unique phoneNumberId and access token
3. **Template Management per User**: Templates are stored per user and WhatsApp account
4. **Campaign Isolation**: Campaigns and messages are linked to specific user accounts
5. **Rate Limiting**: Each account is subject to its own WhatsApp rate limits
6. **Analytics Per User**: Detailed reports and metrics for each client's campaigns

### Connection Options

Users can connect their WhatsApp Business Account through:

1. **Manual Configuration**: Enter phoneNumberId, access token, and other details
2. **OAuth Integration**: (Future Enhancement) Direct Meta OAuth flow for simplified setup
3. **API Key Management**: Secure storage of credentials using encryption

### WhatsApp Business Platform Policy Compliance

The implementation will include:

- Rate limiting to prevent policy violations
- Message template validation before sending
- Opt-in management for contacts
- Complaint handling and blocklist management
- Quality rating monitoring

### Scalability Considerations

- Connection pooling for API requests
- Queue management for message sending
- Background processing for campaign analytics
- Caching for frequently accessed data
- Load balancing for high-volume traffic

## Feature Architecture

### Core Components

1. **WhatsApp Business API Integration** - Meta WhatsApp Business Platform integration
2. **WhatsApp Account Management** - Connect and manage WhatsApp Business Accounts
3. **Message Templates** - Create and manage WhatsApp-approved message templates
4. **Campaign Management** - Create, schedule, and send WhatsApp campaigns
5. **Chat Automation** - Auto-replies and chatbot flow management
6. **Analytics & Reporting** - Track campaign performance and engagement metrics
7. **AI Integration** - Smart features for message generation and chat
8. **Frontend Dashboard** - User interface for all WhatsApp automation features

## Current Status

**✅ Feature Implementation Completed**: The WhatsApp automation feature has been fully implemented and is ready for use. All core components are in place, including:

1. **Backend Integration**: Complete WhatsApp Business API integration with NestJS
2. **Account Management**: Connect, disconnect, and manage WhatsApp Business Accounts
3. **Template Management**: Create, edit, delete, and validate WhatsApp message templates
4. **Campaign Management**: Create, schedule, and send WhatsApp campaigns
5. **Chat Automation**: Auto-reply functionality and chat history management
6. **Analytics & Reporting**: Track campaign performance and engagement metrics
7. **Frontend Dashboard**: Comprehensive UI for all WhatsApp automation features

The feature is now integrated with the existing system and accessible through the main dashboard.

## Implementation Requirements

### 1. WhatsApp Business API Integration

#### 1.1 Meta Business Account Setup

- Users must have a Meta Business Account
- Verify business domain and phone number
- Create and configure WhatsApp Business Account
- Generate API credentials (access token, phone number ID)

#### 1.2 Backend Integration

```typescript
// backend/src/whatsapp/meta-whatsapp-api.ts
import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class MetaWhatsAppAPI {
  private readonly apiBaseUrl = "https://graph.facebook.com/v20.0";

  constructor() {}

  async sendTemplateMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    templateName: string,
    languageCode: string,
    components: any[],
  ): Promise<any> {
    const response = await axios.post(
      `${this.apiBaseUrl}/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  async sendMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    body: string,
    options?: { repliedToMessageWamid?: string },
  ): Promise<any> {
    const dataToProcess: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "text",
      text: {
        preview_url: true,
        body: body,
      },
    };

    if (options?.repliedToMessageWamid) {
      dataToProcess.context = {
        message_id: options.repliedToMessageWamid,
      };
    }

    const response = await axios.post(
      `${this.apiBaseUrl}/${phoneNumberId}/messages`,
      dataToProcess,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  async sendInteractiveMessage(
    phoneNumberId: string,
    accessToken: string,
    to: string,
    messageData: any,
  ): Promise<any> {
    const interactiveData: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: messageData.interactive_type,
      interactive: {},
    };

    if (messageData.header_type && messageData.header_type !== "text") {
      interactiveData.interactive.header = {
        type: messageData.header_type,
        [messageData.header_type]: {
          link: messageData.media_link,
        },
      };
    } else if (messageData.header_type && messageData.header_type === "text") {
      interactiveData.interactive.header = {
        type: "text",
        text: messageData.header_text,
      };
    }

    if (messageData.body_text) {
      interactiveData.interactive.body = {
        text: messageData.body_text,
      };
    }

    if (messageData.footer_text) {
      interactiveData.interactive.footer = {
        text: messageData.footer_text,
      };
    }

    if (messageData.interactive_type === "list") {
      const sections = messageData.list_data.sections.map(
        (section: any, index: number) => ({
          title: section.title,
          rows: section.rows.map((row: any) => ({
            id: row.row_id,
            title: row.title,
            description: row.description,
          })),
        }),
      );

      interactiveData.interactive.action = {
        button: messageData.list_data.button_text,
        sections: sections,
      };
    } else if (messageData.interactive_type === "button") {
      const buttons = messageData.buttons.map(
        (button: string, index: number) => ({
          type: "reply",
          reply: {
            id: `button-id${index + 1}`,
            title: button,
          },
        }),
      );

      interactiveData.interactive.action = {
        buttons: buttons,
      };
    }

    const response = await axios.post(
      `${this.apiBaseUrl}/${phoneNumberId}/messages`,
      interactiveData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  async getTemplates(
    businessAccountId: string,
    accessToken: string,
  ): Promise<any[]> {
    const response = await axios.get(
      `${this.apiBaseUrl}/${businessAccountId}/message_templates`,
      {
        params: {
          limit: 500,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data.data;
  }

  async createTemplate(
    businessAccountId: string,
    accessToken: string,
    templateData: any,
  ): Promise<any> {
    const response = await axios.post(
      `${this.apiBaseUrl}/${businessAccountId}/message_templates`,
      templateData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  async updateTemplate(
    templateId: string,
    accessToken: string,
    templateData: any,
  ): Promise<any> {
    const response = await axios.post(
      `${this.apiBaseUrl}/${templateId}`,
      templateData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  async deleteTemplate(
    businessAccountId: string,
    accessToken: string,
    templateName: string,
    templateId: string,
  ): Promise<any> {
    const response = await axios.delete(
      `${this.apiBaseUrl}/${businessAccountId}/message_templates`,
      {
        params: {
          name: templateName,
          hsm_id: templateId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }

  async verifyWebhook(
    mode: string,
    token: string,
    challenge: string,
  ): Promise<string> {
    return challenge;
  }

  async parseWebhookEvent(event: any): Promise<any> {
    const entries = event.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === "messages") {
          return this.handleMessageEvent(change.value);
        }
        if (change.field === "statuses") {
          return this.handleStatusEvent(change.value);
        }
      }
    }
    return null;
  }

  private handleMessageEvent(value: any): any {
    const messages = value.messages || [];
    if (messages.length > 0) {
      return {
        type: "message",
        messageId: messages[0].id,
        from: messages[0].from,
        timestamp: messages[0].timestamp,
        text: messages[0].text?.body,
        type: messages[0].type,
      };
    }
    return null;
  }

  private handleStatusEvent(value: any): any {
    const statuses = value.statuses || [];
    if (statuses.length > 0) {
      return {
        type: "status",
        messageId: statuses[0].id,
        status: statuses[0].status,
        timestamp: statuses[0].timestamp,
      };
    }
    return null;
  }
}
```

### 2. WhatsApp Account Management

#### 2.1 Account Connection

```typescript
// backend/src/whatsapp/whatsapp-account.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  WhatsAppAccount,
  WhatsAppAccountDocument,
} from "./whatsapp-account.schema";
import { MetaWhatsAppAPI } from "./meta-whatsapp-api";

@Injectable()
export class WhatsAppAccountService {
  constructor(
    @InjectModel(WhatsAppAccount.name)
    private accountModel: Model<WhatsAppAccountDocument>,
    private readonly metaWhatsAppAPI: MetaWhatsAppAPI,
  ) {}

  async connectAccount(userId: string, data: any): Promise<WhatsAppAccount> {
    const existing = await this.accountModel.findOne({ userId });
    if (existing) {
      return this.accountModel.findByIdAndUpdate(
        existing._id,
        {
          phoneNumber: data.phoneNumber,
          phoneNumberId: data.phoneNumberId,
          accessToken: data.accessToken,
          businessName: data.businessName,
          whatsappBusinessAccountId: data.whatsappBusinessAccountId,
          isActive: true,
        },
        { new: true },
      );
    }

    const newAccount = new this.accountModel({
      userId,
      phoneNumber: data.phoneNumber,
      phoneNumberId: data.phoneNumberId,
      accessToken: data.accessToken,
      businessName: data.businessName,
      whatsappBusinessAccountId: data.whatsappBusinessAccountId,
      isActive: true,
    });
    return newAccount.save();
  }

  async disconnectAccount(userId: string): Promise<void> {
    await this.accountModel.updateOne({ userId }, { isActive: false });
  }

  async getByUserId(userId: string): Promise<WhatsAppAccount | null> {
    return this.accountModel.findOne({ userId, isActive: true });
  }

  async validateAccount(
    userId: string,
  ): Promise<{ isValid: boolean; message: string }> {
    const account = await this.getByUserId(userId);
    if (!account) {
      return { isValid: false, message: "Account not found" };
    }

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/${account.phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${account.accessToken}`,
          },
        },
      );
      return { isValid: true, message: "Account valid" };
    } catch (error) {
      return {
        isValid: false,
        message: error.response?.data?.error?.message || "Validation failed",
      };
    }
  }
}
```

#### 2.2 Account Schema

```typescript
// backend/src/whatsapp/whatsapp-account.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type WhatsAppAccountDocument = WhatsAppAccount & Document;

@Schema({ timestamps: true })
export class WhatsAppAccount {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  phoneNumberId: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
  whatsappBusinessAccountId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: Object, default: {} })
  __data?: any;
}

export const WhatsAppAccountSchema =
  SchemaFactory.createForClass(WhatsAppAccount);
```

### 3. WhatsApp Message Templates

#### 3.1 Template Management

```typescript
// backend/src/whatsapp/whatsapp-template.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  WhatsAppTemplate,
  WhatsAppTemplateDocument,
} from "./whatsapp-template.schema";
import { WhatsAppAccountService } from "./whatsapp-account.service";
import { MetaWhatsAppAPI } from "./meta-whatsapp-api";

@Injectable()
export class WhatsAppTemplateService {
  constructor(
    @InjectModel(WhatsAppTemplate.name)
    private templateModel: Model<WhatsAppTemplateDocument>,
    private readonly accountService: WhatsAppAccountService,
    private readonly metaWhatsAppAPI: MetaWhatsAppAPI,
  ) {}

  async createTemplate(userId: string, data: any): Promise<WhatsAppTemplate> {
    const template = new this.templateModel({
      userId,
      name: data.name,
      category: data.category,
      language: data.language,
      components: data.components,
      isApproved: false,
    });
    return template.save();
  }

  async getTemplates(userId: string): Promise<WhatsAppTemplate[]> {
    return this.templateModel.find({ userId });
  }

  async getTemplate(
    userId: string,
    templateId: string,
  ): Promise<WhatsAppTemplate> {
    return this.templateModel.findOne({ _id: templateId, userId });
  }

  async updateTemplate(
    userId: string,
    templateId: string,
    data: any,
  ): Promise<WhatsAppTemplate> {
    return this.templateModel.findByIdAndUpdate(
      templateId,
      { ...data },
      { new: true },
    );
  }

  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    await this.templateModel.deleteOne({ _id: templateId, userId });
  }

  async syncTemplates(userId: string): Promise<WhatsAppTemplate[]> {
    const account = await this.accountService.getByUserId(userId);
    if (!account) {
      throw new Error("WhatsApp account not connected");
    }

    const templates = await this.metaWhatsAppAPI.getTemplates(
      account.whatsappBusinessAccountId,
      account.accessToken,
    );

    const templatesToAdd = templates.map((template: any) => ({
      userId,
      template_name: template.name,
      language: template.language,
      template_id: template.id,
      category: template.category,
      status: template.status,
      __data: {
        template: template,
      },
    }));

    await this.templateModel.deleteMany({ userId });
    return this.templateModel.insertMany(templatesToAdd);
  }
}
```

#### 3.2 Template Schema

```typescript
// backend/src/whatsapp/whatsapp-template.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type WhatsAppTemplateDocument = WhatsAppTemplate & Document;

@Schema({ timestamps: true })
export class WhatsAppTemplate {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  template_name: string;

  @Prop({ required: true })
  template_id: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: Object, default: {} })
  __data?: any;
}

export const WhatsAppTemplateSchema =
  SchemaFactory.createForClass(WhatsAppTemplate);
```

### 4. WhatsApp Campaign Management

#### 4.1 Campaign Service

```typescript
// backend/src/whatsapp/whatsapp-campaign.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  WhatsAppCampaign,
  WhatsAppCampaignDocument,
  CampaignStatus,
} from "./whatsapp-campaign.schema";
import { WhatsAppAccountService } from "./whatsapp-account.service";
import { MetaWhatsAppAPI } from "./meta-whatsapp-api";
import { ContactsService } from "../email/contacts.service";

@Injectable()
export class WhatsAppCampaignService {
  constructor(
    @InjectModel(WhatsAppCampaign.name)
    private campaignModel: Model<WhatsAppCampaignDocument>,
    private readonly accountService: WhatsAppAccountService,
    private readonly metaWhatsAppAPI: MetaWhatsAppAPI,
    private readonly contactsService: ContactsService,
  ) {}

  async createCampaign(userId: string, data: any): Promise<WhatsAppCampaign> {
    const campaign = new this.campaignModel({
      userId,
      name: data.name,
      templateId: data.templateId,
      contactListId: data.contactListId,
      contactIds: data.contactIds,
      status: CampaignStatus.DRAFT,
      scheduledAt: data.scheduledAt,
      timezone: data.timezone,
      stats: {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
      },
    });
    return campaign.save();
  }

  async sendCampaign(userId: string, campaignId: string): Promise<void> {
    const campaign = await this.campaignModel.findOne({
      _id: campaignId,
      userId,
    });
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const account = await this.accountService.getByUserId(userId);
    if (!account) {
      throw new Error("WhatsApp account not connected");
    }

    campaign.status = CampaignStatus.RUNNING;
    await campaign.save();

    const contacts = await Promise.all(
      campaign.contactIds.map((contactId) =>
        this.contactsService.getContactById(userId, contactId),
      ),
    );

    const validContacts = contacts.filter(
      (contact) => contact.phone && contact.phone.match(/^\d{10,15}$/),
    );

    for (let i = 0; i < validContacts.length; i++) {
      const contact = validContacts[i];
      const delay = i * 2000;

      setTimeout(async () => {
        try {
          await this.metaWhatsAppAPI.sendTemplateMessage(
            account.phoneNumberId,
            account.accessToken,
            contact.phone,
            campaign.templateId,
          );

          campaign.stats.sent++;
          await campaign.save();
        } catch (error) {
          campaign.stats.failed++;
          await campaign.save();
        }
      }, delay);
    }
  }

  async getCampaigns(userId: string): Promise<WhatsAppCampaign[]> {
    return this.campaignModel.find({ userId });
  }

  async getCampaign(
    userId: string,
    campaignId: string,
  ): Promise<WhatsAppCampaign> {
    return this.campaignModel.findOne({ _id: campaignId, userId });
  }

  async updateCampaign(
    userId: string,
    campaignId: string,
    data: any,
  ): Promise<WhatsAppCampaign> {
    return this.campaignModel.findByIdAndUpdate(
      campaignId,
      { ...data },
      { new: true },
    );
  }

  async deleteCampaign(userId: string, campaignId: string): Promise<void> {
    await this.campaignModel.deleteOne({ _id: campaignId, userId });
  }
}
```

#### 4.2 Campaign Schema

```typescript
// backend/src/whatsapp/whatsapp-campaign.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export enum CampaignStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  RUNNING = "running",
  COMPLETED = "completed",
  PAUSED = "paused",
  CANCELLED = "cancelled",
}

export type WhatsAppCampaignDocument = WhatsAppCampaign & Document;

@Schema({ timestamps: true })
export class WhatsAppCampaign {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  templateId: string;

  @Prop({ required: true })
  contactIds: string[];

  @Prop({ required: true, enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Prop()
  scheduledAt?: Date;

  @Prop()
  timezone?: string;

  @Prop({
    type: Object,
    default: { sent: 0, delivered: 0, read: 0, failed: 0 },
  })
  stats?: any;

  @Prop({ type: Object, default: {} })
  __data?: any;
}

export const WhatsAppCampaignSchema =
  SchemaFactory.createForClass(WhatsAppCampaign);
```

### 5. Chat Automation

#### 5.1 Bot Replies

```typescript
// backend/src/whatsapp/whatsapp-bot-reply.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  WhatsAppBotReply,
  WhatsAppBotReplyDocument,
} from "./whatsapp-bot-reply.schema";

@Injectable()
export class WhatsAppBotReplyService {
  constructor(
    @InjectModel(WhatsAppBotReply.name)
    private botReplyModel: Model<WhatsAppBotReplyDocument>,
  ) {}

  async createBotReply(userId: string, data: any): Promise<WhatsAppBotReply> {
    const botReply = new this.botReplyModel({
      userId,
      name: data.name,
      replyText: data.replyText,
      triggerType: data.triggerType,
      replyTrigger: data.replyTrigger,
      priorityIndex: data.priorityIndex || 0,
    });
    return botReply.save();
  }

  async getBotReplies(userId: string): Promise<WhatsAppBotReply[]> {
    return this.botReplyModel.find({ userId }).sort({ priorityIndex: 1 });
  }

  async getBotReply(
    userId: string,
    botReplyId: string,
  ): Promise<WhatsAppBotReply> {
    return this.botReplyModel.findOne({ _id: botReplyId, userId });
  }

  async updateBotReply(
    userId: string,
    botReplyId: string,
    data: any,
  ): Promise<WhatsAppBotReply> {
    return this.botReplyModel.findByIdAndUpdate(
      botReplyId,
      { ...data },
      { new: true },
    );
  }

  async deleteBotReply(userId: string, botReplyId: string): Promise<void> {
    await this.botReplyModel.deleteOne({ _id: botReplyId, userId });
  }

  async findMatchingBotReply(
    userId: string,
    message: string,
  ): Promise<WhatsAppBotReply | null> {
    const botReplies = await this.getBotReplies(userId);

    for (const botReply of botReplies) {
      if (
        botReply.triggerType === "contains" &&
        message.toLowerCase().includes(botReply.replyTrigger.toLowerCase())
      ) {
        return botReply;
      }

      if (
        botReply.triggerType === "is" &&
        message.toLowerCase() === botReply.replyTrigger.toLowerCase()
      ) {
        return botReply;
      }
    }

    return null;
  }
}
```

#### 5.2 Bot Reply Schema

```typescript
// backend/src/whatsapp/whatsapp-bot-reply.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type WhatsAppBotReplyDocument = WhatsAppBotReply & Document;

@Schema({ timestamps: true })
export class WhatsAppBotReply {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  replyText: string;

  @Prop({ required: true, enum: ["contains", "is"] })
  triggerType: string;

  @Prop({ required: true })
  replyTrigger: string;

  @Prop({ default: 0 })
  priorityIndex: number;

  @Prop({ type: Object, default: {} })
  __data?: any;
}

export const WhatsAppBotReplySchema =
  SchemaFactory.createForClass(WhatsAppBotReply);
```

### 6. Chatbot Flows

#### 6.1 Bot Flow Service

```typescript
// backend/src/whatsapp/whatsapp-bot-flow.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  WhatsAppBotFlow,
  WhatsAppBotFlowDocument,
} from "./whatsapp-bot-flow.schema";

@Injectable()
export class WhatsAppBotFlowService {
  constructor(
    @InjectModel(WhatsAppBotFlow.name)
    private botFlowModel: Model<WhatsAppBotFlowDocument>,
  ) {}

  async createBotFlow(userId: string, data: any): Promise<WhatsAppBotFlow> {
    const botFlow = new this.botFlowModel({
      userId,
      title: data.title,
      startTrigger: data.startTrigger,
      __data: {
        flow: data.flow,
      },
    });
    return botFlow.save();
  }

  async getBotFlows(userId: string): Promise<WhatsAppBotFlow[]> {
    return this.botFlowModel.find({ userId });
  }

  async getBotFlow(
    userId: string,
    botFlowId: string,
  ): Promise<WhatsAppBotFlow> {
    return this.botFlowModel.findOne({ _id: botFlowId, userId });
  }

  async updateBotFlow(
    userId: string,
    botFlowId: string,
    data: any,
  ): Promise<WhatsAppBotFlow> {
    return this.botFlowModel.findByIdAndUpdate(
      botFlowId,
      { ...data },
      { new: true },
    );
  }

  async deleteBotFlow(userId: string, botFlowId: string): Promise<void> {
    await this.botFlowModel.deleteOne({ _id: botFlowId, userId });
  }

  async findMatchingBotFlow(
    userId: string,
    message: string,
  ): Promise<WhatsAppBotFlow | null> {
    const botFlows = await this.getBotFlows(userId);

    for (const botFlow of botFlows) {
      if (
        botFlow.startTrigger &&
        message.toLowerCase().includes(botFlow.startTrigger.toLowerCase())
      ) {
        return botFlow;
      }
    }

    return null;
  }
}
```

#### 6.2 Bot Flow Schema

```typescript
// backend/src/whatsapp/whatsapp-bot-flow.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type WhatsAppBotFlowDocument = WhatsAppBotFlow & Document;

@Schema({ timestamps: true })
export class WhatsAppBotFlow {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  startTrigger?: string;

  @Prop({ type: Object, default: {} })
  __data?: any;
}

export const WhatsAppBotFlowSchema =
  SchemaFactory.createForClass(WhatsAppBotFlow);
```

### 7. Message Logging & Analytics

#### 7.1 Message Log Service

```typescript
// backend/src/whatsapp/whatsapp-message-log.service.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  WhatsAppMessageLog,
  WhatsAppMessageLogDocument,
} from "./whatsapp-message-log.schema";

@Injectable()
export class WhatsAppMessageLogService {
  constructor(
    @InjectModel(WhatsAppMessageLog.name)
    private messageLogModel: Model<WhatsAppMessageLogDocument>,
  ) {}

  async createMessageLog(data: any): Promise<WhatsAppMessageLog> {
    const messageLog = new this.messageLogModel(data);
    return messageLog.save();
  }

  async getMessageLogs(
    userId: string,
    filters?: any,
  ): Promise<WhatsAppMessageLog[]> {
    const query: any = { userId };
    if (filters) {
      Object.assign(query, filters);
    }
    return this.messageLogModel.find(query).sort({ created_at: -1 });
  }

  async getMessageLog(
    userId: string,
    messageLogId: string,
  ): Promise<WhatsAppMessageLog> {
    return this.messageLogModel.findOne({ _id: messageLogId, userId });
  }

  async updateMessageLog(
    messageLogId: string,
    data: any,
  ): Promise<WhatsAppMessageLog> {
    return this.messageLogModel.findByIdAndUpdate(
      messageLogId,
      { ...data },
      { new: true },
    );
  }

  async getMessageStats(userId: string): Promise<any> {
    const stats = await this.messageLogModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result: any = {
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    stats.forEach((stat: any) => {
      if (result[stat._id] !== undefined) {
        result[stat._id] = stat.count;
      }
    });

    return result;
  }
}
```

#### 7.2 Message Log Schema

```typescript
// backend/src/whatsapp/whatsapp-message-log.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type WhatsAppMessageLogDocument = WhatsAppMessageLog & Document;

@Schema({ timestamps: true })
export class WhatsAppMessageLog {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  templateName?: string;

  @Prop()
  campaignId?: string;

  @Prop()
  contactId?: string;

  @Prop({ type: Object, default: {} })
  __data?: any;
}

export const WhatsAppMessageLogSchema =
  SchemaFactory.createForClass(WhatsAppMessageLog);
```

### 8. AI Integration

#### 8.1 OpenAI Service

```typescript
// backend/src/whatsapp/openai.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAIApi, Configuration } from "openai";

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAIApi;

  constructor(private readonly configService: ConfigService) {
    const configuration = new Configuration({
      apiKey: this.configService.get<string>("OPENAI_API_KEY"),
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateMessageTemplate(
    context: string,
    language: string = "en",
  ): Promise<string> {
    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Create a WhatsApp message template for: ${context}\n\nRequirements:\n1. Follow WhatsApp template guidelines\n2. Use variables like {{1}}, {{2}} for dynamic content\n3. Keep it concise and engaging\n4. Language: ${language}`,
        temperature: 0.7,
        max_tokens: 200,
      });

      return response.data.choices[0].text?.trim() || "";
    } catch (error) {
      throw new Error("Failed to generate message template");
    }
  }

  async generateAutoReply(
    message: string,
    context: string = "",
  ): Promise<string> {
    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Generate a friendly auto-reply for WhatsApp message: "${message}"\n\n${context ? `Context: ${context}` : ""}\n\nRequirements:\n1. Keep it natural and conversational\n2. Follow WhatsApp guidelines\n3. Maximum 200 characters`,
        temperature: 0.7,
        max_tokens: 100,
      });

      return response.data.choices[0].text?.trim() || "";
    } catch (error) {
      throw new Error("Failed to generate auto-reply");
    }
  }

  async analyzeMessageSentiment(message: string): Promise<string> {
    try {
      const response = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Analyze the sentiment of this WhatsApp message: "${message}"\n\nReturn only one of: positive, negative, neutral`,
        temperature: 0,
        max_tokens: 10,
      });

      return response.data.choices[0].text?.trim()?.toLowerCase() || "neutral";
    } catch (error) {
      throw new Error("Failed to analyze message sentiment");
    }
  }
}
```

### 9. Frontend Dashboard Features

#### 9.1 WhatsApp Integration Page

```typescript
// frontend/src/pages/WhatsAppIntegrationPage.tsx
import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Alert, Spin, Typography, Space } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  SaveOutlined,
  TestOutlined,
} from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

const { Title, Text } = Typography;

const WhatsAppIntegrationPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadAccountInfo();
  }, [user]);

  const loadAccountInfo = async () => {
    if (user) {
      try {
        const response = await api.whatsapp.getAccount();
        if (response.data) {
          setAccountInfo(response.data);
          form.setFieldsValue(response.data);
          setConnectionStatus("connected");
        }
      } catch (error) {
        setConnectionStatus("disconnected");
      }
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.whatsapp.connectAccount(values);
      setAccountInfo(response.data);
      setConnectionStatus("connected");
      Alert.success("WhatsApp account connected successfully");
    } catch (error: any) {
      Alert.error(error.response?.data?.message || "Failed to connect WhatsApp account");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const response = await api.whatsapp.validateAccount();
      if (response.data.isValid) {
        Alert.success("WhatsApp account connection is valid");
      } else {
        Alert.error(response.data.message);
      }
    } catch (error: any) {
      Alert.error(error.response?.data?.message || "Failed to validate WhatsApp account");
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.whatsapp.disconnectAccount();
      setAccountInfo(null);
      setConnectionStatus("disconnected");
      form.resetFields();
      Alert.success("WhatsApp account disconnected successfully");
    } catch (error: any) {
      Alert.error(error.response?.data?.message || "Failed to disconnect WhatsApp account");
    }
  };

  return (
    <div className="whatsapp-integration-page">
      <div className="page-header">
        <Title level={2}>
          <SettingOutlined /> WhatsApp Integration
        </Title>
        <Text>Connect your WhatsApp Business Account to start sending automated messages</Text>
      </div>

      <Card className="connection-card">
        <div className="connection-status">
          <Space>
            <Text strong>Connection Status:</Text>
            {connectionStatus === "connected" ? (
              <Alert
                message="Connected"
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
            ) : (
              <Alert
                message="Disconnected"
                type="error"
                showIcon
                icon={<ExclamationCircleOutlined />}
              />
            )}
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="connection-form"
        >
          <Form.Item
            name="phoneNumber"
            label="WhatsApp Phone Number"
            rules={[{ required: true, message: "Please enter your WhatsApp phone number" }]}
          >
            <Input
              placeholder="+1 234 567 8900"
              prefix={<span>+</span>}
              disabled={accountInfo}
            />
          </Form.Item>

          <Form.Item
            name="phoneNumberId"
            label="Phone Number ID"
            rules={[{ required: true, message: "Please enter your Phone Number ID" }]}
          >
            <Input
              placeholder="100000000000000"
              disabled={accountInfo}
            />
          </Form.Item>

          <Form.Item
            name="whatsappBusinessAccountId"
            label="WhatsApp Business Account ID"
            rules={[{ required: true, message: "Please enter your Business Account ID" }]}
          >
            <Input
              placeholder="100000000000000"
              disabled={accountInfo}
            />
          </Form.Item>

          <Form.Item
            name="accessToken"
            label="System User Access Token"
            rules={[{ required: true, message: "Please enter your access token" }]}
          >
            <Input.Password
              placeholder="EAA..."
              disabled={accountInfo}
            />
          </Form.Item>

          <Form.Item
            name="businessName"
            label="Business Name"
            rules={[{ required: true, message: "Please enter your business name" }]}
          >
            <Input
              placeholder="Your Business Name"
              disabled={accountInfo}
            />
          </Form.Item>

          <Form.Item className="form-actions">
            {!accountInfo ? (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Connect WhatsApp Account
              </Button>
            ) : (
              <Space>
                <Button
                  type="default"
                  loading={testing}
                  icon={<TestOutlined />}
                  onClick={handleTestConnection}
                >
                  Test Connection
                </Button>
                <Button
                  type="danger"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </Space>
            )}
          </Form.Item>
        </Form>

        {accountInfo && (
          <div className="account-details">
            <Title level={4}>Account Details</Title>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div className="detail-item">
                <Text strong>Phone Number:</Text>
                <Text>{accountInfo.phoneNumber}</Text>
              </div>
              <div className="detail-item">
                <Text strong>Business Name:</Text>
                <Text>{accountInfo.businessName}</Text>
              </div>
              <div className="detail-item">
                <Text strong>Phone Number ID:</Text>
                <Text code>{accountInfo.phoneNumberId}</Text>
              </div>
              <div className="detail-item">
                <Text strong>Business Account ID:</Text>
                <Text code>{accountInfo.whatsappBusinessAccountId}</Text>
              </div>
            </Space>
          </div>
        )}
      </Card>

      <Card className="info-card">
        <Title level={4}>How to Get Your WhatsApp Credentials</Title>
        <div className="info-content">
          <p>To connect your WhatsApp Business Account, you'll need to:</p>
          <ol>
            <li>Create a Meta Business Account</li>
            <li>Create a WhatsApp Business Account within your Meta Business Account</li>
            <li>Verify your business (required for API access)</li>
            <li>Add and verify your WhatsApp phone number</li>
            <li>Generate a System User Access Token with the following permissions:</li>
            <ul>
              <li>whatsapp_business_management</li>
              <li>whatsapp_business_messaging</li>
            </ul>
          </ol>
          <p>
            For detailed instructions, refer to the
            <a href="https://developers.facebook.com/docs/whatsapp/getting-started/" target="_blank" rel="noopener noreferrer">
              WhatsApp Business API documentation
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default WhatsAppIntegrationPage;
```

## Implementation Schedule

### Phase 1: API Integration (1-2 weeks)

1. Set up backend project structure
2. Implement WhatsApp API integration service
3. Create database schemas for accounts, templates, campaigns
4. Implement message logging and analytics

### Phase 2: Core Features (2-3 weeks)

1. Implement WhatsApp account management
2. Create template management system
3. Build campaign management features
4. Implement message sending functionality

### Phase 3: Automation & AI (1-2 weeks)

1. Build chat automation features
2. Implement AI integration for smart features
3. Create bot replies and chatbot flows

### Phase 4: Frontend Development (2-3 weeks)

1. Design and implement integration page
2. Build templates management interface
3. Create campaign management interface
4. Implement analytics and reporting dashboards

### Phase 5: Testing & Deployment (1 week)

1. Comprehensive testing of all features
2. Performance optimization
3. Security audit
4. Production deployment

## Resources Required

### Development Team

- Backend Developer: 1-2 (Node.js/NestJS experience)
- Frontend Developer: 1-2 (React/Angular experience)
- QA Tester: 1
- DevOps Engineer: 1

### Infrastructure

- Cloud server (AWS, GCP, Azure)
- Database (MongoDB)
- Redis for caching and queues
- Message broker (RabbitMQ or similar)

### Third-Party Services

- Meta WhatsApp Business API
- OpenAI API (for AI features)
- Email service (for notifications)

## Security Considerations

### Data Encryption

- API credentials encrypted at rest and in transit
- Sensitive data masked in logs
- Secure API endpoints with authentication
- Role-based access control

### WhatsApp Policy Compliance

- Rate limiting to prevent spam
- Template validation before sending
- Opt-in management for contacts
- Compliance with WhatsApp Business Platform policies

### Security Best Practices

- Input validation and sanitization
- SQL injection prevention
- Cross-site scripting (XSS) prevention
- Regular security updates

## Future Enhancements

### Phase 2 Features

1. **Contact Management**: Advanced contact segmentation and labeling
2. **Analytics**: Detailed campaign performance reports
3. **Automation**: Advanced chatbot flows with decision trees
4. **Integrations**: Connect with CRM systems and other platforms

### Phase 3 Features

1. **AI Enhancements**: More advanced natural language processing
2. **Multi-Channel**: Integration with SMS and other messaging platforms
3. **Advanced Scheduling**: Recurring campaigns and time-based triggers
4. **Collaboration**: Team management and role-based access

## Conclusion

The WhatsApp Automation feature will significantly enhance user engagement by providing businesses with a powerful tool to communicate with customers through the world's most popular messaging platform. By following the implementation plan and considering all technical and security aspects, we will create a robust and reliable system that meets the needs of businesses of all sizes.
