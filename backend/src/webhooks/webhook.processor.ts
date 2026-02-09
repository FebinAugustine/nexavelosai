import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from './webhooks.schema';
import axios from 'axios';
import * as crypto from 'crypto';

@Processor('webhooks')
export class WebhookProcessor {
  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
  ) {}

  @Process('send-webhook')
  async handleWebhook(job: Job) {
    const { webhookId, event, payload } = job.data;

    const webhook = await this.webhookModel.findById(webhookId).exec();

    if (!webhook || !webhook.active) {
      return;
    }

    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'X-NexaVelosAI-Event': event,
        'X-NexaVelosAI-Timestamp': new Date().toISOString(),
      };

      if (webhook.secret) {
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex');
        headers['X-NexaVelosAI-Signature'] = signature;
      }

      await axios.post(webhook.url, payload, {
        headers,
        timeout: 10000,
      });

      webhook.failureCount = 0;
      webhook.lastSuccessAt = new Date();
    } catch (error) {
      webhook.failureCount += 1;
      webhook.lastFailureAt = new Date();

      if (webhook.failureCount >= 5) {
        webhook.active = false;
      }
    }

    await webhook.save();
  }
}
