import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailHistory,
  EmailHistoryDocument,
  EmailStatus,
} from './email-history.schema';

@Injectable()
export class EmailHistoryService {
  constructor(
    @InjectModel(EmailHistory.name)
    private emailHistoryModel: Model<EmailHistoryDocument>,
  ) {}

  async createEmailHistory(data: any): Promise<EmailHistory> {
    const emailHistory = new this.emailHistoryModel(data);
    return emailHistory.save();
  }

  async getEmailHistory(userId: string, filters: any): Promise<any[]> {
    const query: any = { userId };

    if (filters.search) {
      query.$or = [
        { recipientEmail: { $regex: filters.search, $options: 'i' } },
        { recipientName: { $regex: filters.search, $options: 'i' } },
        { subject: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.dateRange) {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      query.sentAt = { $gte: startDate };
    }

    return this.emailHistoryModel.find(query).sort({ sentAt: -1 });
  }

  async updateEmailStatus(
    emailHistoryId: string,
    status: EmailStatus,
    errorMessage?: string,
  ): Promise<EmailHistory | null> {
    const updateData: any = { status };

    if (status === EmailStatus.SENT) {
      updateData.sentAt = new Date();
    } else if (status === EmailStatus.FAILED) {
      updateData.failedAt = new Date();
      if (errorMessage) {
        updateData.errorMessage = errorMessage;
      }
    }

    return this.emailHistoryModel.findByIdAndUpdate(
      emailHistoryId,
      updateData,
      { new: true },
    );
  }

  async deleteEmailHistory(emailHistoryId: string): Promise<void> {
    await this.emailHistoryModel.deleteOne({ _id: emailHistoryId });
  }
}
