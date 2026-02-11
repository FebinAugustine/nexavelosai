import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ChatSession,
  ChatSessionDocument,
} from '../agents/chat-session.schema';
import { Lead, LeadDocument } from '../leads/leads.schema';
import { Agent, AgentDocument } from '../agents/agents.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(ChatSession.name)
    private chatSessionModel: Model<ChatSessionDocument>,
    @InjectModel(Lead.name)
    private leadModel: Model<LeadDocument>,
    @InjectModel(Agent.name)
    private agentModel: Model<AgentDocument>,
  ) {}

  /**
   * Get chat volume trends over time
   */
  async getChatVolumeTrends(
    userId: string,
    timeRange: string = '7d',
  ): Promise<any[]> {
    const now = new Date();
    let startDate = new Date();

    // Calculate time range
    switch (timeRange) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Group by date
    const groupBy =
      timeRange === '24h'
        ? {
            $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' },
          }
        : {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          };

    const result = await this.chatSessionModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return result.map((item) => ({
      date: item._id,
      count: item.count,
    }));
  }

  /**
   * Get response time metrics
   */
  async getResponseTimeMetrics(userId: string): Promise<any> {
    const result = await this.chatSessionModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          avgResponseTime: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$avgResponseTime' },
          min: { $min: '$avgResponseTime' },
          max: { $max: '$avgResponseTime' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    return result[0];
  }

  /**
   * Get lead conversion metrics
   */
  async getLeadConversionMetrics(userId: string): Promise<any> {
    const [totalSessions, convertedSessions] = await Promise.all([
      this.chatSessionModel.countDocuments({
        userId: new Types.ObjectId(userId),
      }),
      this.chatSessionModel.countDocuments({
        userId: new Types.ObjectId(userId),
        convertedToLead: true,
      }),
    ]);

    const conversionRate =
      totalSessions > 0 ? (convertedSessions / totalSessions) * 100 : 0;

    return {
      totalSessions,
      convertedSessions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(userId: string): Promise<any> {
    const result = await this.chatSessionModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          avgMessages: { $avg: '$messageCount' },
          avgDuration: { $avg: '$duration' },
          totalMessages: { $sum: '$messageCount' },
          activeSessions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
            },
          },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        avgMessages: 0,
        avgDuration: 0,
        totalMessages: 0,
        activeSessions: 0,
      };
    }

    return {
      avgMessages: result[0].avgMessages
        ? parseFloat(result[0].avgMessages.toFixed(1))
        : 0,
      avgDuration: result[0].avgDuration
        ? parseFloat(result[0].avgDuration.toFixed(0))
        : 0,
      totalMessages: result[0].totalMessages || 0,
      activeSessions: result[0].activeSessions || 0,
    };
  }

  /**
   * Get geographic data
   */
  async getGeographicData(userId: string): Promise<any[]> {
    const result = await this.chatSessionModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          country: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            country: '$country',
            city: { $ifNull: ['$city', 'Unknown'] },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    return result.map((item) => ({
      country: item._id.country,
      city: item._id.city,
      count: item.count,
    }));
  }

  /**
   * Get agent performance metrics
   */
  async getAgentPerformance(userId: string): Promise<any[]> {
    const [agents, sessions] = await Promise.all([
      this.agentModel
        .find({ userId: new Types.ObjectId(userId) })
        .select('_id name'),
      this.chatSessionModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: '$agentId',
            totalSessions: { $sum: 1 },
            convertedSessions: {
              $sum: { $cond: ['$convertedToLead', 1, 0] },
            },
            avgResponseTime: { $avg: '$avgResponseTime' },
            avgMessages: { $avg: '$messageCount' },
          },
        },
      ]),
    ]);

    // Debug output
    console.log('Agents:', agents);
    console.log('Sessions grouped by agentId:', sessions);

    return agents.map((agent) => {
      const sessionData = sessions.find((s) => {
        const sessionAgentId = s._id
          ? typeof s._id === 'string'
            ? s._id
            : s._id.toString()
          : null;
        const currentAgentId = agent._id.toString();
        return sessionAgentId === currentAgentId;
      });

      return {
        agentId: agent._id.toString(),
        name: agent.name,
        totalSessions: sessionData?.totalSessions || 0,
        convertedSessions: sessionData?.convertedSessions || 0,
        conversionRate:
          sessionData?.totalSessions > 0
            ? parseFloat(
                (
                  (sessionData.convertedSessions / sessionData.totalSessions) *
                  100
                ).toFixed(2),
              )
            : 0,
        avgResponseTime: sessionData?.avgResponseTime
          ? parseFloat(sessionData.avgResponseTime.toFixed(0))
          : 0,
        avgMessages: sessionData?.avgMessages
          ? parseFloat(sessionData.avgMessages.toFixed(1))
          : 0,
      };
    });
  }

  /**
   * Get custom report based on parameters
   */
  async getCustomReport(userId: string, params: any): Promise<any> {
    const { metrics, dimensions, timeRange, format } = params;
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const matchStage = {
      userId: new Types.ObjectId(userId),
      createdAt: { $gte: startDate, $lte: now },
    };

    const groupStage: any = {
      _id: {},
    };

    // Add dimensions to group by
    if (dimensions.includes('agent')) {
      groupStage._id.agentId = '$agentId';
    }
    if (dimensions.includes('time')) {
      groupStage._id.date = {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
      };
    }
    if (dimensions.includes('geo')) {
      groupStage._id.country = '$country';
    }

    // Add metrics to accumulate
    if (metrics.includes('chatVolume')) {
      groupStage.totalSessions = { $sum: 1 };
    }
    if (metrics.includes('responseTime')) {
      groupStage.avgResponseTime = { $avg: '$avgResponseTime' };
    }
    if (metrics.includes('conversionRate')) {
      groupStage.convertedSessions = {
        $sum: { $cond: ['$convertedToLead', 1, 0] },
      };
    }
    if (metrics.includes('engagement')) {
      groupStage.avgMessages = { $avg: '$messageCount' };
      groupStage.avgDuration = { $avg: '$duration' };
    }

    const result = await this.chatSessionModel.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { '_id.date': 1 } },
    ]);

    // Format response based on report format
    if (format === 'csv') {
      return this.formatToCSV(result);
    } else if (format === 'excel') {
      return this.formatToExcel(result);
    } else {
      return result;
    }
  }

  private formatToCSV(data: any[]): string {
    // CSV formatting implementation
    const headers = [
      'Date',
      'Agent',
      'Country',
      'Total Sessions',
      'Avg Response Time',
      'Converted Sessions',
      'Avg Messages',
      'Avg Duration',
    ];
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          row._id.date || '',
          row._id.agentId || '',
          row._id.country || '',
          row.totalSessions || '',
          row.avgResponseTime || '',
          row.convertedSessions || '',
          row.avgMessages || '',
          row.avgDuration || '',
        ].join(','),
      ),
    ].join('\n');

    return csvContent;
  }

  private formatToExcel(data: any[]): any {
    // Excel formatting implementation
    return data;
  }
}
