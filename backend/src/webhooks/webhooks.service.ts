import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Webhook, WebhookDocument, WebhookEventType } from './webhooks.schema';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
    @InjectQueue('webhooks') private webhookQueue: Queue,
  ) {}

  async createWebhook(
    userId: string,
    url: string,
    events: WebhookEventType[],
    secret?: string,
  ): Promise<WebhookDocument> {
    const webhook = new this.webhookModel({
      userId: new Types.ObjectId(userId),
      url,
      events,
      secret,
    });

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
    updateData: Partial<Webhook>,
  ): Promise<WebhookDocument> {
    const webhook = await this.getWebhookById(id, userId);
    Object.assign(webhook, updateData);
    return webhook.save();
  }

  async deleteWebhook(id: string, userId: string): Promise<void> {
    const webhook = await this.getWebhookById(id, userId);
    await this.webhookModel.deleteOne({ _id: webhook._id }).exec();
  }

  async triggerWebhook(event: WebhookEventType, payload: any): Promise<void> {
    // Find all active webhooks that subscribe to this event
    const webhooks = await this.webhookModel
      .find({
        active: true,
        events: event,
      })
      .exec();

    for (const webhook of webhooks) {
      await this.webhookQueue.add('send-webhook', {
        webhookId: webhook._id.toString(),
        event,
        payload,
      });
    }
  }
}
