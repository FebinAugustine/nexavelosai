import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailCampaign,
  EmailCampaignDocument,
  CampaignStatus,
} from './campaigns.schema';
import { EmailTemplatesService } from './templates.service';
import { ContactsService } from '../contacts/contacts.service';
import { GmailService } from './gmail.service';
import { EmailHistoryService } from './email-history.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class EmailCampaignsService {
  constructor(
    @InjectModel(EmailCampaign.name)
    private campaignModel: Model<EmailCampaignDocument>,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly contactsService: ContactsService,
    private readonly gmailService: GmailService,
    private readonly emailHistoryService: EmailHistoryService,
    @InjectQueue('email-queue')
    private readonly emailQueue: Queue,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createCampaign(userId: string, data: any): Promise<EmailCampaign> {
    console.log('Creating campaign with data:', data); // Debug log
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
      contactListId: data.contactListId,
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
    const campaigns = await this.campaignModel.find({ userId });
    console.log('Retrieved campaigns:', campaigns); // Debug log
    return campaigns;
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

  async updateCampaignStats(campaignId: string): Promise<void> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Get all email history for this campaign
    const emailHistory =
      await this.emailHistoryService.getEmailHistoryByCampaignId(campaignId);

    // Calculate stats
    const totalSent = emailHistory.filter(
      (email) => email.status === 'sent',
    ).length;
    const totalFailed = emailHistory.filter(
      (email) => email.status === 'failed',
    ).length;
    const totalPending = emailHistory.filter(
      (email) => email.status === 'pending',
    ).length;

    // Update campaign stats using atomic operations
    await this.campaignModel.findByIdAndUpdate(
      campaignId,
      {
        $set: {
          stats: {
            sent: totalSent,
            delivered: totalSent, // Assuming sent = delivered for now
            opened: 0, // These would need to be tracked with email tracking
            clicked: 0,
            bounced: totalFailed,
            unsubscribed: 0,
          },
        },
      },
      { new: true },
    );

    // Check if campaign is complete
    const totalProcessed = totalSent + totalFailed;
    if (
      totalProcessed === campaign.contactIds.length &&
      (campaign.stats?.sent || 0) !== totalSent
    ) {
      await this.campaignModel.findByIdAndUpdate(campaignId, {
        $set: { status: CampaignStatus.COMPLETED },
      });
    }
  }

  async startCampaign(userId: string, campaignId: string): Promise<void> {
    const campaign = await this.getCampaign(userId, campaignId);

    // Check if campaign is already running
    if (campaign.status === CampaignStatus.RUNNING) {
      console.log(`Campaign ${campaignId} is already running`);
      return;
    }

    // Update campaign status to running
    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: CampaignStatus.RUNNING,
    });

    console.log(`Campaign ${campaignId} started`);

    // Queue email sending
    this.queueCampaignEmails(userId, campaign);

    // Emit real-time campaign update
    const updatedCampaign = await this.getCampaign(userId, campaignId);
    this.eventsGateway.sendCampaignUpdate(userId, updatedCampaign);
  }

  async pauseCampaign(userId: string, campaignId: string): Promise<void> {
    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: CampaignStatus.PAUSED,
    });

    // Clear pending jobs for this campaign to pause
    const jobs = await this.emailQueue.getJobs(['waiting', 'delayed']);
    for (const job of jobs) {
      if (job.data.campaignId === campaignId) {
        await job.remove();
      }
    }

    // Emit real-time campaign update
    const updatedCampaign = await this.getCampaign(userId, campaignId);
    this.eventsGateway.sendCampaignUpdate(userId, updatedCampaign);
  }

  async stopCampaign(userId: string, campaignId: string): Promise<void> {
    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: CampaignStatus.CANCELLED,
    });

    // Clear all pending jobs for this campaign
    const jobs = await this.emailQueue.getJobs([
      'waiting',
      'delayed',
      'active',
    ]);
    for (const job of jobs) {
      if (job.data.campaignId === campaignId) {
        await job.remove();
      }
    }

    // Emit real-time campaign update
    const updatedCampaign = await this.getCampaign(userId, campaignId);
    this.eventsGateway.sendCampaignUpdate(userId, updatedCampaign);
  }

  async sendCampaign(userId: string, campaignId: string): Promise<void> {
    const campaign = await this.getCampaign(userId, campaignId);
    await this.campaignModel.findByIdAndUpdate(campaignId, {
      status: CampaignStatus.RUNNING,
    });

    // Queue email sending
    this.queueCampaignEmails(userId, campaign);

    // Emit real-time campaign update
    const updatedCampaign = await this.getCampaign(userId, campaignId);
    this.eventsGateway.sendCampaignUpdate(userId, updatedCampaign);
  }

  private async queueCampaignEmails(userId: string, campaign: EmailCampaign) {
    const { contactIds, subject, content, googleAccountId, interval } =
      campaign;
    const sendInterval = interval || 60; // Default to 60 seconds if not specified

    // Get all contacts for this campaign
    const contacts = await Promise.all(
      contactIds.map(async (contactId) => {
        return this.contactsService.getContactById(userId, contactId);
      }),
    );

    // Filter out contacts with no email
    const validContacts = contacts.filter((contact) => contact.email);

    console.log(
      `Queuing ${validContacts.length} emails for campaign ${campaign._id}`,
    );

    // Queue emails with interval
    for (let i = 0; i < validContacts.length; i++) {
      const contact = validContacts[i];

      // Calculate delay based on interval
      const delay = i * sendInterval * 1000;

      // Add email to queue
      await this.emailQueue.add(
        'send-email',
        {
          userId,
          to: contact.email,
          subject,
          content,
          campaignId: campaign._id,
          googleAccountId,
        },
        {
          delay,
          attempts: 3, // Retry 3 times if failed
          backoff: {
            type: 'exponential',
            delay: 5000, // 5 seconds initial delay
          },
        },
      );
    }
  }
}
