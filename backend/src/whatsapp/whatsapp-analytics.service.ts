import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WhatsAppAnalytics,
  WhatsAppAnalyticsDocument,
} from './whatsapp-analytics.schema';
import { WhatsAppCampaignsService } from './whatsapp-campaigns.service';

@Injectable()
export class WhatsAppAnalyticsService {
  constructor(
    @InjectModel(WhatsAppAnalytics.name)
    private analyticsModel: Model<WhatsAppAnalyticsDocument>,
    private readonly whatsAppCampaignsService: WhatsAppCampaignsService,
  ) {}

  async trackMessageStatus(data: any): Promise<WhatsAppAnalytics> {
    const analytics = new this.analyticsModel({
      userId: data.userId,
      campaignId: data.campaignId,
      messageId: data.messageId,
      to: data.to,
      status: data.status,
      timestamp: new Date(),
      errorMessage: data.errorMessage,
      templateName: data.templateName,
      messageType: data.messageType,
    });

    // Update campaign metrics if campaignId is provided
    if (data.campaignId) {
      await this.whatsAppCampaignsService.updateCampaignMetrics(
        data.campaignId,
        data.status,
      );
    }

    return analytics.save();
  }

  async getCampaignAnalytics(userId: string, campaignId: string): Promise<any> {
    const campaignData = await this.analyticsModel.aggregate([
      { $match: { userId, campaignId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const metrics = {
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    };

    for (const item of campaignData) {
      if (metrics[item._id.toLowerCase()]) {
        metrics[item._id.toLowerCase()] = item.count;
      }
    }

    const totalMessages = Object.values(metrics).reduce(
      (sum, count) => sum + count,
      0,
    );
    const deliveryRate =
      totalMessages > 0 ? (metrics.delivered / metrics.sent) * 100 : 0;
    const readRate =
      totalMessages > 0 ? (metrics.read / metrics.delivered) * 100 : 0;
    const failureRate =
      totalMessages > 0 ? (metrics.failed / totalMessages) * 100 : 0;

    return {
      totalMessages,
      metrics,
      deliveryRate: parseFloat(deliveryRate.toFixed(2)),
      readRate: parseFloat(readRate.toFixed(2)),
      failureRate: parseFloat(failureRate.toFixed(2)),
    };
  }

  async getContactAnalytics(userId: string): Promise<any> {
    const contactData = await this.analyticsModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$to',
          totalMessages: { $sum: 1 },
          lastMessageAt: { $max: '$timestamp' },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    return contactData;
  }

  async getOverallAnalytics(userId: string): Promise<any> {
    const overallData = await this.analyticsModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        },
      },
    ]);

    if (overallData.length === 0) {
      return {
        totalMessages: 0,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        deliveryRate: 0,
        readRate: 0,
        failureRate: 0,
      };
    }

    const data = overallData[0];
    const deliveryRate = data.sent > 0 ? (data.delivered / data.sent) * 100 : 0;
    const readRate =
      data.delivered > 0 ? (data.read / data.delivered) * 100 : 0;
    const failureRate =
      data.totalMessages > 0 ? (data.failed / data.totalMessages) * 100 : 0;

    return {
      totalMessages: data.totalMessages,
      sent: data.sent,
      delivered: data.delivered,
      read: data.read,
      failed: data.failed,
      deliveryRate: parseFloat(deliveryRate.toFixed(2)),
      readRate: parseFloat(readRate.toFixed(2)),
      failureRate: parseFloat(failureRate.toFixed(2)),
    };
  }

  async getAnalyticsByPeriod(
    userId: string,
    period: 'day' | 'week' | 'month' | 'year',
  ): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const periodData = await this.analyticsModel.aggregate([
      { $match: { userId, timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format:
                period === 'day'
                  ? '%Y-%m-%d'
                  : period === 'week'
                    ? '%Y-%U'
                    : '%Y-%m',
              date: '$timestamp',
            },
          },
          totalMessages: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return periodData.map((item) => ({
      period: item._id,
      totalMessages: item.totalMessages,
      sent: item.sent,
      delivered: item.delivered,
      read: item.read,
      failed: item.failed,
      deliveryRate:
        item.sent > 0
          ? parseFloat(((item.delivered / item.sent) * 100).toFixed(2))
          : 0,
      readRate:
        item.delivered > 0
          ? parseFloat(((item.read / item.delivered) * 100).toFixed(2))
          : 0,
      failureRate:
        item.totalMessages > 0
          ? parseFloat(((item.failed / item.totalMessages) * 100).toFixed(2))
          : 0,
    }));
  }

  async getTemplatePerformance(userId: string): Promise<any> {
    const templateData = await this.analyticsModel.aggregate([
      { $match: { userId, templateName: { $exists: true } } },
      {
        $group: {
          _id: '$templateName',
          totalMessages: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        },
      },
      { $sort: { totalMessages: -1 } },
    ]);

    return templateData.map((item) => ({
      templateName: item._id,
      totalMessages: item.totalMessages,
      sent: item.sent,
      delivered: item.delivered,
      read: item.read,
      failed: item.failed,
      deliveryRate:
        item.sent > 0
          ? parseFloat(((item.delivered / item.sent) * 100).toFixed(2))
          : 0,
      readRate:
        item.delivered > 0
          ? parseFloat(((item.read / item.delivered) * 100).toFixed(2))
          : 0,
      failureRate:
        item.totalMessages > 0
          ? parseFloat(((item.failed / item.totalMessages) * 100).toFixed(2))
          : 0,
    }));
  }

  async exportAnalytics(
    userId: string,
    format: 'csv' | 'json' = 'json',
  ): Promise<string> {
    const analytics = await this.analyticsModel
      .find({ userId })
      .sort({ timestamp: -1 });

    if (format === 'json') {
      return JSON.stringify(analytics, null, 2);
    } else if (format === 'csv') {
      const headers = [
        'userId',
        'campaignId',
        'messageId',
        'to',
        'status',
        'timestamp',
        'templateName',
        'messageType',
      ];
      const csvContent = [
        headers.join(','),
        ...analytics.map((item) =>
          [
            item.userId,
            item.campaignId || '',
            item.messageId || '',
            item.to,
            item.status,
            item.timestamp.toISOString(),
            item.templateName || '',
            item.messageType || '',
          ].join(','),
        ),
      ].join('\n');

      return csvContent;
    } else {
      throw new Error('Unsupported format');
    }
  }
}
