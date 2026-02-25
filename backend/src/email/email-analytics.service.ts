import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailCampaign, EmailCampaignDocument } from './campaigns.schema';
import { GoogleAccount, GoogleAccountDocument } from './google-account.schema';
import {
  EmailHistory,
  EmailHistoryDocument,
  EmailStatus,
} from './email-history.schema';

@Injectable()
export class EmailAnalyticsService {
  constructor(
    @InjectModel(EmailCampaign.name)
    private campaignModel: Model<EmailCampaignDocument>,
    @InjectModel(GoogleAccount.name)
    private googleAccountModel: Model<GoogleAccountDocument>,
    @InjectModel(EmailHistory.name)
    private emailHistoryModel: Model<EmailHistoryDocument>,
  ) {}

  async getOverallAnalytics(userId: string): Promise<any> {
    // Get connected accounts count
    const connectedAccounts = await this.googleAccountModel.countDocuments({
      userId,
    });

    // Get total sent emails
    const totalSent = await this.emailHistoryModel.countDocuments({
      userId,
      status: EmailStatus.SENT,
    });

    // Get failed emails
    const totalFailed = await this.emailHistoryModel.countDocuments({
      userId,
      status: EmailStatus.FAILED,
    });

    // Calculate success rate
    const totalEmails = totalSent + totalFailed;
    const successRate =
      totalEmails > 0
        ? parseFloat(((totalSent / totalEmails) * 100).toFixed(2))
        : 0;

    // Get active campaigns
    const activeCampaigns = await this.campaignModel.countDocuments({
      userId,
      status: { $in: ['running', 'scheduled'] },
    });

    // Get total campaigns
    const totalCampaigns = await this.campaignModel.countDocuments({ userId });

    // Get today's sent emails
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySent = await this.emailHistoryModel.countDocuments({
      userId,
      status: EmailStatus.SENT,
      sentAt: { $gte: today },
    });

    // Get recent campaigns
    const recentCampaigns = await this.campaignModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name status contactIds stats')
      .lean();

    // Process recent campaigns
    const processedCampaigns = recentCampaigns.map((campaign) => ({
      _id: campaign._id.toString(),
      name: campaign.name,
      status: campaign.status,
      emailsSent: campaign.stats?.sent || 0,
      totalEmails: campaign.contactIds?.length || 0,
    }));

    return {
      connectedAccounts,
      totalSent,
      todaySent,
      successRate,
      activeCampaigns,
      totalCampaigns,
      failed: totalFailed,
      recentCampaigns: processedCampaigns,
    };
  }
}
