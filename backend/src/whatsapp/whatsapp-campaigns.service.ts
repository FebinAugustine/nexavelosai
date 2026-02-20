import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WhatsAppCampaign,
  WhatsAppCampaignDocument,
} from './whatsapp-campaigns.schema';
import { MetaWhatsAppAPI } from './meta-whatsapp-api';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { WhatsAppTemplatesService } from './whatsapp-templates.service';

@Injectable()
export class WhatsAppCampaignsService {
  constructor(
    @InjectModel(WhatsAppCampaign.name)
    private campaignModel: Model<WhatsAppCampaignDocument>,
    private readonly metaWhatsAppAPI: MetaWhatsAppAPI,
    private readonly whatsAppAccountService: WhatsAppAccountService,
    private readonly whatsAppTemplatesService: WhatsAppTemplatesService,
  ) {}

  async getCampaigns(userId: string): Promise<WhatsAppCampaign[]> {
    return this.campaignModel
      .find({ userId, isDeleted: false })
      .sort({ createdAt: -1 });
  }

  async getCampaignById(
    userId: string,
    campaignId: string,
  ): Promise<WhatsAppCampaign | null> {
    return this.campaignModel.findOne({
      _id: campaignId,
      userId,
      isDeleted: false,
    });
  }

  async createCampaign(
    userId: string,
    campaignData: any,
  ): Promise<WhatsAppCampaign> {
    // Validate campaign data
    this.validateCampaign(campaignData);

    const campaign = new this.campaignModel({
      userId,
      name: campaignData.name,
      description: campaignData.description,
      templateId: campaignData.templateId,
      contactList: campaignData.contactList,
      scheduledAt: campaignData.scheduledAt,
      status: campaignData.scheduledAt ? 'scheduled' : 'draft',
      metrics: {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
      },
    });

    return campaign.save();
  }

  async updateCampaign(
    userId: string,
    campaignId: string,
    campaignData: any,
  ): Promise<WhatsAppCampaign | null> {
    const existingCampaign = await this.getCampaignById(userId, campaignId);
    if (!existingCampaign) {
      return null;
    }

    // Validate campaign data
    if (
      campaignData.name ||
      campaignData.templateId ||
      campaignData.contactList
    ) {
      this.validateCampaign(campaignData);
    }

    return this.campaignModel.findByIdAndUpdate(
      campaignId,
      {
        ...campaignData,
        status:
          campaignData.scheduledAt && existingCampaign.status === 'draft'
            ? 'scheduled'
            : existingCampaign.status,
      },
      { new: true },
    );
  }

  async deleteCampaign(userId: string, campaignId: string): Promise<boolean> {
    const campaign = await this.getCampaignById(userId, campaignId);
    if (!campaign) {
      return false;
    }

    await this.campaignModel.findByIdAndUpdate(campaignId, { isDeleted: true });
    return true;
  }

  async sendCampaign(userId: string, campaignId: string): Promise<void> {
    const campaign = await this.getCampaignById(userId, campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === 'sending' || campaign.status === 'sent') {
      throw new Error('Campaign is already being sent or has been sent');
    }

    const account = await this.whatsAppAccountService.getByUserId(userId);
    if (!account) {
      throw new Error('WhatsApp account not found');
    }

    const template = await this.whatsAppTemplatesService.getTemplateById(
      userId,
      campaign.templateId,
    );
    if (!template || template.status !== 'approved') {
      throw new Error('Template not found or not approved');
    }

    // Update campaign status to sending
    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: 'sending',
    });

    // Send messages to all contacts
    let sentCount = 0;
    let failedCount = 0;

    for (const contact of campaign.contactList) {
      try {
        await this.metaWhatsAppAPI.sendTemplateMessage(
          account.phoneNumberId,
          account.accessToken,
          contact,
          template.templateName,
          template.languageCode,
          template.components,
        );
        sentCount++;
      } catch (error) {
        failedCount++;
        // Log error
        console.error(`Failed to send message to ${contact}:`, error.message);
      }

      // Add delay to respect WhatsApp rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Update campaign metrics and status
    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: 'sent',
      sentAt: new Date(),
      metrics: {
        sent: sentCount,
        delivered: 0, // Will be updated via webhooks
        read: 0, // Will be updated via webhooks
        failed: failedCount,
      },
    });
  }

  async scheduleCampaign(
    userId: string,
    campaignId: string,
    scheduledAt: Date,
  ): Promise<void> {
    const campaign = await this.getCampaignById(userId, campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: 'scheduled',
      scheduledAt: scheduledAt,
    });
  }

  async pauseCampaign(userId: string, campaignId: string): Promise<void> {
    const campaign = await this.getCampaignById(userId, campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'scheduled' && campaign.status !== 'sending') {
      throw new Error('Campaign is not in a schedulable or sending state');
    }

    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: 'paused',
      pausedAt: new Date(),
    });
  }

  async resumeCampaign(userId: string, campaignId: string): Promise<void> {
    const campaign = await this.getCampaignById(userId, campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'paused') {
      throw new Error('Campaign is not in a paused state');
    }

    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: campaign.scheduledAt ? 'scheduled' : 'draft',
    });
  }

  private validateCampaign(campaignData: any): void {
    if (!campaignData.name) {
      throw new Error('Campaign name is required');
    }

    if (!campaignData.templateId) {
      throw new Error('Template is required');
    }

    if (!campaignData.contactList || campaignData.contactList.length === 0) {
      throw new Error('Campaign must have at least one contact');
    }

    // Validate phone numbers
    for (const contact of campaignData.contactList) {
      const phoneRegex = /^[1-9]\d{7,14}$/;
      if (!phoneRegex.test(contact.replace(/[\s\-\(\)]/g, ''))) {
        throw new Error(`Invalid phone number: ${contact}`);
      }
    }

    if (
      campaignData.scheduledAt &&
      new Date(campaignData.scheduledAt) <= new Date()
    ) {
      throw new Error('Scheduled date must be in the future');
    }
  }

  async updateCampaignMetrics(
    campaignId: string,
    status: string,
  ): Promise<void> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      return;
    }

    const metricKey = status.toLowerCase() as keyof typeof campaign.metrics;
    if (campaign.metrics[metricKey] !== undefined) {
      campaign.metrics[metricKey]++;
      await campaign.save();
    }
  }
}
