import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Webhook, WebhookDocument, WebhookEventType } from './webhooks.schema';
import {
  WebhookEvent,
  WebhookEventDocument,
  WebhookEventStatus,
} from './webhook-events.schema';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Agent, AgentDocument } from '../agents/agents.schema';
import { EventsGateway } from '../events/events.gateway';
import { MailService } from '../mail/mail.service';
import { User, UserDocument } from '../users/users.schema';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
    @InjectModel(WebhookEvent.name)
    private webhookEventModel: Model<WebhookEventDocument>,
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectQueue('webhooks') private webhookQueue: Queue,
    private eventsGateway: EventsGateway,
    private mailService: MailService,
  ) {}

  async createWebhook(
    userId: string,
    url: string,
    events: WebhookEventType[],
    secret?: string,
    domain?: string,
    agentId?: string,
  ): Promise<WebhookDocument> {
    const webhookData: any = {
      userId: new Types.ObjectId(userId),
      url,
      events,
      secret,
    };

    if (domain) {
      webhookData.domain = domain;
    }

    if (agentId) {
      webhookData.agentId = new Types.ObjectId(agentId);
    }

    const webhook = new this.webhookModel(webhookData);
    return webhook.save();
  }

  async getWebhooksByUser(userId: string): Promise<WebhookDocument[]> {
    return this.webhookModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async getWebhookById(id: string, userId: string): Promise<WebhookDocument> {
    const webhook = await this.webhookModel
      .findOne({
        _id: id,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return webhook;
  }

  async updateWebhook(
    id: string,
    userId: string,
    updateData: Partial<{
      url: string;
      events: WebhookEventType[];
      active: boolean;
      secret?: string;
      domain?: string;
      agentId?: string;
    }>,
  ): Promise<WebhookDocument> {
    const webhook = await this.getWebhookById(id, userId);

    if (updateData.domain !== undefined) {
      webhook.domain = updateData.domain;
    }

    if (updateData.agentId !== undefined) {
      webhook.agentId = updateData.agentId
        ? new Types.ObjectId(updateData.agentId)
        : undefined;
    }

    if (updateData.url !== undefined) {
      webhook.url = updateData.url;
    }

    if (updateData.events !== undefined) {
      webhook.events = updateData.events;
    }

    if (updateData.active !== undefined) {
      webhook.active = updateData.active;
    }

    if (updateData.secret !== undefined) {
      webhook.secret = updateData.secret;
    }

    return webhook.save();
  }

  async deleteWebhook(id: string, userId: string): Promise<void> {
    const webhook = await this.getWebhookById(id, userId);
    await Promise.all([
      this.webhookModel.deleteOne({ _id: webhook._id }).exec(),
      this.deleteWebhookEventsByWebhookId(id, userId),
    ]);
  }

  async triggerWebhook(event: WebhookEventType, payload: any): Promise<void> {
    // Build query to find active webhooks that subscribe to this event
    const query: any = {
      active: true,
      events: event,
    };

    // If payload contains agentId, fetch the agent to get its domain
    if (payload.agentId) {
      const agent = await this.agentModel.findById(payload.agentId).exec();
      if (agent && agent.domain) {
        payload.domain = agent.domain;
      }
    }

    // Normalize domain for consistent comparison (remove www. prefix)
    const normalizedDomain = payload.domain
      ? payload.domain.replace(/^www\./, '')
      : null;

    // If payload contains domain, filter webhooks accordingly
    if (normalizedDomain) {
      query.$or = [
        { domain: { $in: [normalizedDomain, `www.${normalizedDomain}`] } },
        { domain: { $exists: false } },
        { domain: null },
      ];
    }

    // If payload contains agentId, filter webhooks accordingly
    if (payload.agentId) {
      query.$or = query.$or || [];
      query.$or.push({
        $or: [
          { agentId: payload.agentId },
          { agentId: { $exists: false } },
          { agentId: null },
        ],
      });
    }

    const webhooks = await this.webhookModel.find(query).exec();

    // If no webhooks found with specific domain/agent, check for general webhooks (without domain/agent)
    if (webhooks.length === 0) {
      const generalQuery: any = {
        active: true,
        events: event,
        $or: [
          { domain: { $exists: false }, agentId: { $exists: false } },
          { domain: null, agentId: null },
        ],
      };
      const generalWebhooks = await this.webhookModel.find(generalQuery).exec();
      webhooks.push(...generalWebhooks);
    }

    // Filter webhooks to only those matching the specific domain if we have one
    let filteredWebhooks = webhooks;
    if (normalizedDomain) {
      filteredWebhooks = webhooks.filter((webhook) => {
        if (!webhook.domain || webhook.domain === null) {
          return true;
        }
        const normalizedWebhookDomain = webhook.domain.replace(/^www\./, '');
        return normalizedWebhookDomain === normalizedDomain;
      });
    }

    // Filter webhooks to only those matching the specific agentId if we have one
    if (payload.agentId) {
      filteredWebhooks = filteredWebhooks.filter(
        (webhook) =>
          webhook.agentId === payload.agentId ||
          !webhook.agentId ||
          webhook.agentId === null,
      );
    }

    console.log('Triggering webhooks for event:', event, 'payload:', payload);
    console.log(
      'Filtered webhooks:',
      filteredWebhooks.map((w) => ({
        id: w._id,
        url: w.url,
        domain: w.domain,
        agentId: w.agentId,
      })),
    );

    for (const webhook of filteredWebhooks) {
      await this.webhookQueue.add('send-webhook', {
        webhookId: webhook._id.toString(),
        event,
        payload,
      });
    }
  }

  async triggerSpecificWebhook(
    webhookId: string,
    event: WebhookEventType,
    payload: any,
  ): Promise<void> {
    // Trigger a specific webhook regardless of active status or event subscription (for testing purposes)
    console.log('triggerSpecificWebhook called with:', {
      webhookId,
      event,
      payload,
    });
    const webhook = await this.webhookModel.findById(webhookId).exec();
    console.log('Found webhook in service:', webhook);

    if (webhook) {
      console.log('Adding to queue');
      await this.webhookQueue.add('send-webhook', {
        webhookId: webhook._id.toString(),
        event,
        payload,
      });
    } else {
      console.log('Webhook not found');
    }
  }

  async createWebhookEvent(
    webhookId: string,
    eventType: string,
    payload: any,
  ): Promise<WebhookEventDocument> {
    const webhook = await this.webhookModel.findById(webhookId).exec();
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    const event = new this.webhookEventModel({
      webhookId: new Types.ObjectId(webhookId),
      userId: webhook.userId,
      eventType,
      payload,
      status: WebhookEventStatus.PENDING,
      retryCount: 0,
    });

    const savedEvent = await event.save();

    // Emit real-time notification to the user
    this.eventsGateway.sendWebhookEventNotification(
      webhook.userId.toString(),
      savedEvent.toJSON(),
    );

    // Emit real-time notification to all team members
    this.eventsGateway.sendWebhookEventNotificationToTeam(
      webhook.userId.toString(),
      savedEvent.toJSON(),
    );

    // Send email notification
    this.sendWebhookEventEmail(webhook.userId.toString(), savedEvent, webhook);

    return savedEvent;
  }

  async updateWebhookEvent(
    eventId: string,
    updateData: Partial<WebhookEvent>,
  ): Promise<WebhookEventDocument> {
    const event = await this.webhookEventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('Webhook event not found');
    }

    Object.assign(event, updateData);
    const updatedEvent = await event.save();

    // Emit real-time notification to the user
    this.eventsGateway.sendWebhookEventNotification(
      event.userId.toString(),
      updatedEvent.toJSON(),
    );

    // Emit real-time notification to all team members
    this.eventsGateway.sendWebhookEventNotificationToTeam(
      event.userId.toString(),
      updatedEvent.toJSON(),
    );

    // Send email notification if status changed
    if (updateData.status) {
      const webhook = await this.webhookModel.findById(event.webhookId).exec();
      if (webhook) {
        this.sendWebhookEventEmail(
          event.userId.toString(),
          updatedEvent,
          webhook,
        );
      }
    }

    return updatedEvent;
  }

  private async sendWebhookEventEmail(
    userId: string,
    event: WebhookEventDocument,
    webhook: WebhookDocument,
  ): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (user && user.email) {
      await this.mailService.sendWebhookEventEmail(
        user.email,
        event.eventType,
        event.status,
        webhook.url,
        event.payload,
      );
    }
  }

  async getWebhookEventsByWebhookId(
    webhookId: string,
    userId: string,
    query: any = {},
  ): Promise<any> {
    const { page = 1, limit = 50, status, startDate, endDate } = query;

    const filter: any = {
      webhookId: new Types.ObjectId(webhookId),
      userId: new Types.ObjectId(userId),
    };

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;
    const events = await this.webhookEventModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.webhookEventModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);

    return {
      items: events,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
    };
  }

  async getWebhookEventsByUserId(
    userId: string,
    query: any = {},
  ): Promise<any> {
    const {
      page = 1,
      limit = 50,
      status,
      eventType,
      startDate,
      endDate,
    } = query;

    const filter: any = {
      userId: new Types.ObjectId(userId),
    };

    if (status) {
      filter.status = status;
    }

    if (eventType) {
      filter.eventType = eventType;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;
    const events = await this.webhookEventModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('webhookId')
      .exec();

    const total = await this.webhookEventModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(total / limit);

    return {
      items: events,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
    };
  }

  async getWebhookEventById(
    eventId: string,
    userId: string,
  ): Promise<WebhookEventDocument> {
    const event = await this.webhookEventModel
      .findOne({
        _id: eventId,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!event) {
      throw new NotFoundException('Webhook event not found');
    }

    return event;
  }

  async deleteWebhookEventsByWebhookId(
    webhookId: string,
    userId: string,
  ): Promise<void> {
    await this.webhookEventModel
      .deleteMany({
        webhookId: new Types.ObjectId(webhookId),
        userId: new Types.ObjectId(userId),
      })
      .exec();
  }
}
