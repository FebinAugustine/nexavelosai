import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Lead, LeadDocument } from './leads.schema';
import {
  ChatSession,
  ChatSessionDocument,
} from '../agents/chat-session.schema';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(ChatSession.name)
    private chatSessionModel: Model<ChatSessionDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createLead(data: any): Promise<LeadDocument> {
    console.log('Creating lead with data:', data);
    const leadData = {
      ...data,
      userId:
        typeof data.userId === 'string'
          ? new Types.ObjectId(data.userId)
          : data.userId,
      agentId:
        typeof data.agentId === 'string'
          ? new Types.ObjectId(data.agentId)
          : data.agentId,
    };
    const lead = new this.leadModel(leadData);
    const savedLead = await lead.save();

    console.log('Saved lead:', savedLead);

    // Invalidate cache
    const cacheKey = `leads:${data.userId}`;
    await this.cacheManager.del(cacheKey);

    return savedLead;
  }

  async findAll(userId: string, query: any = {}): Promise<LeadDocument[]> {
    console.log(
      'LeadsService.findAll called with userId:',
      userId,
      'query:',
      query,
    );

    const cacheKey = `leads:${userId}:${JSON.stringify(query)}`;
    const cachedLeads = await this.cacheManager.get<LeadDocument[]>(cacheKey);

    if (cachedLeads) {
      console.log('Returning cached leads');
      return cachedLeads;
    }

    // Debug: Check if there are any leads in the database
    const allLeads = await this.leadModel.find({}).exec();
    console.log('All leads in DB:', allLeads.length);
    console.log(
      'All leads details:',
      allLeads.map((lead) => ({
        id: lead._id,
        userId: lead.userId,
        email: lead.email,
        createdAt: lead.createdAt,
      })),
    );

    // Query by both string and ObjectId to handle existing data
    const filter: any = {
      $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$or = [
        { email: { $regex: query.search, $options: 'i' } },
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
        { company: { $regex: query.search, $options: 'i' } },
      ];
    }

    console.log('MongoDB query filter:', filter);
    const leads = await this.leadModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(query.page ? (query.page - 1) * query.limit : 0)
      .limit(query.limit || 50)
      .exec();

    console.log('Found', leads.length, 'leads for user');
    await this.cacheManager.set(cacheKey, leads, 300000); // 5 minutes
    return leads;
  }

  async findOne(id: string, userId: string): Promise<LeadDocument> {
    const lead = await this.leadModel
      .findOne({
        _id: id,
        $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
      })
      .exec();
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    return lead;
  }

  async updateLead(
    id: string,
    userId: string,
    updateData: any,
  ): Promise<LeadDocument> {
    const lead = await this.leadModel
      .findOneAndUpdate(
        {
          _id: id,
          $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
        },
        updateData,
        { new: true },
      )
      .exec();

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Invalidate cache
    const cacheKey = `leads:${userId}`;
    await this.cacheManager.del(cacheKey);

    return lead;
  }

  async deleteLead(id: string, userId: string): Promise<void> {
    const result = await this.leadModel
      .deleteOne({
        _id: id,
        $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
      })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Lead not found');
    }

    // Invalidate cache
    const cacheKey = `leads:${userId}`;
    await this.cacheManager.del(cacheKey);
  }

  async createChatSession(data: any): Promise<ChatSessionDocument> {
    const session = new this.chatSessionModel(data);
    const savedSession = await session.save();
    return savedSession;
  }

  async findChatSessionsByLead(
    leadId: string,
    userId: string,
  ): Promise<ChatSessionDocument[]> {
    return this.chatSessionModel
      .find({
        leadId: new Types.ObjectId(leadId),
        $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findChatSessionById(
    id: string,
    userId: string,
  ): Promise<ChatSessionDocument> {
    const session = await this.chatSessionModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!session) {
      throw new NotFoundException('Chat session not found');
    }
    return session;
  }

  async updateChatSession(
    id: string,
    userId: string,
    updateData: any,
  ): Promise<ChatSessionDocument> {
    const session = await this.chatSessionModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        updateData,
        { new: true },
      )
      .exec();

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    return session;
  }

  async getLeadCount(userId: string): Promise<number> {
    return this.leadModel
      .countDocuments({
        $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
      })
      .exec();
  }

  async getLeadStats(userId: string): Promise<any> {
    const stats = await this.leadModel
      .aggregate([
        {
          $match: {
            $or: [{ userId: userId }, { userId: new Types.ObjectId(userId) }],
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const result = {
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      lost: 0,
    };

    stats.forEach((stat) => {
      if (result.hasOwnProperty(stat._id)) {
        result[stat._id] = stat.count;
      }
    });

    return result;
  }

  async exportLeads(
    userId: string,
    format: 'csv' | 'json' = 'csv',
  ): Promise<string | object[]> {
    const leads = await this.leadModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();

    if (format === 'json') {
      return leads;
    }

    // Generate CSV
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Company',
      'Website',
      'Status',
      'Created At',
    ];
    const csvContent = [
      headers.join(','),
      ...leads.map((lead) =>
        [
          lead.name || '',
          lead.email,
          lead.phone || '',
          lead.company || '',
          lead.website || '',
          lead.status,
          lead.createdAt ? lead.createdAt.toISOString() : '',
        ]
          .map((field) => `"${field}"`)
          .join(','),
      ),
    ].join('\n');

    return csvContent;
  }
}
