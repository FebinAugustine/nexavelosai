import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from './webhooks.schema';
import {
  WebhookEvent,
  WebhookEventDocument,
  WebhookEventStatus,
} from './webhook-events.schema';
import axios from 'axios';
import * as crypto from 'crypto';
import { WebhooksService } from './webhooks.service';

@Processor('webhooks')
export class WebhookProcessor {
  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
    @InjectModel(WebhookEvent.name)
    private webhookEventModel: Model<WebhookEventDocument>,
    private webhooksService: WebhooksService,
  ) {}

  @Process('send-webhook')
  async handleWebhook(job: Job) {
    console.log('Webhook processor received job:', job.data);
    const { webhookId, event, payload } = job.data;

    const webhook = await this.webhookModel.findById(webhookId).exec();
    console.log('Found webhook:', webhook);

    // Allow test events to be sent even if webhook is inactive
    if (!webhook || (!webhook.active && !payload.test)) {
      console.log('Webhook is not active and not a test event, skipping');
      return;
    }

    // Create event log using service to emit notifications
    const eventLog = await this.webhooksService.createWebhookEvent(
      webhookId,
      event,
      payload,
    );

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

      console.log('Sending webhook to:', webhook.url);
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: 10000,
      });
      console.log('Webhook response status:', response.status);

      // Update event log with success using service to emit notifications
      await this.webhooksService.updateWebhookEvent(eventLog._id.toString(), {
        status: WebhookEventStatus.SUCCESS,
        responseStatus: response.status,
        responseBody: response.data,
        deliveredAt: new Date(),
      });

      webhook.failureCount = 0;
      webhook.lastSuccessAt = new Date();
    } catch (error) {
      console.error('Webhook failed:', error);

      // Update event log with failure using service to emit notifications
      await this.webhooksService.updateWebhookEvent(eventLog._id.toString(), {
        status: WebhookEventStatus.FAILURE,
        errorMessage: error.message,
        responseStatus: error.response?.status,
        responseBody: error.response?.data,
        deliveredAt: new Date(),
      });

      webhook.failureCount += 1;
      webhook.lastFailureAt = new Date();

      if (webhook.failureCount >= 5) {
        webhook.active = false;
      }
    }

    await webhook.save();
  }
}
