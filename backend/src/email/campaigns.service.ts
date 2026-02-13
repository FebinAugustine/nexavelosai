import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailCampaign,
  EmailCampaignDocument,
  CampaignStatus,
} from './campaigns.schema';
import { EmailTemplatesService } from './templates.service';
import { ContactsService } from './contacts.service';

@Injectable()
export class EmailCampaignsService {
  constructor(
    @InjectModel(EmailCampaign.name)
    private campaignModel: Model<EmailCampaignDocument>,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly contactsService: ContactsService,
  ) {}

  async createCampaign(userId: string, data: any): Promise<EmailCampaign> {
    // Get template details to extract subject and content
    const template = await this.emailTemplatesService.getTemplate(
      userId,
      data.templateId,
    );

    // Get contacts for the selected contact list
    const contactsResult = await this.contactsService.getContacts(userId, {
      contactListId: data.contactListId,
    });
    const contactIds = contactsResult.data.map((contact) =>
      contact._id.toString(),
    );

    const campaign = new this.campaignModel({
      userId,
      ...data,
      subject: template.subject,
      content: template.content,
      contactIds,
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
    const campaign = await this.campaignModel.findOne({
      _id: campaignId,
      userId,
    });
    if (!campaign) {
      throw new Error('Campaign not found');
    }
    return campaign;
  }

  async updateCampaign(
    userId: string,
    campaignId: string,
    data: any,
  ): Promise<EmailCampaign> {
    const updated = await this.campaignModel.findByIdAndUpdate(
      campaignId,
      { ...data },
      { new: true },
    );
    if (!updated) {
      throw new Error('Campaign not found');
    }
    return updated;
  }

  async deleteCampaign(userId: string, campaignId: string): Promise<void> {
    await this.campaignModel.deleteOne({ _id: campaignId, userId });
  }

  async sendCampaign(userId: string, campaignId: string): Promise<void> {
    const campaign = await this.getCampaign(userId, campaignId);
    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: CampaignStatus.RUNNING,
    });

    // Queue email sending
  }
}
