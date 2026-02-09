import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookEventType } from './webhooks.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgencyPlanGuard } from './agency-plan.guard';
import axios from 'axios';
import * as crypto from 'crypto';

@Controller('api/webhooks')
@UseGuards(JwtAuthGuard, AgencyPlanGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  async createWebhook(
    @Request() req,
    @Body() body: { url: string; events: WebhookEventType[]; secret?: string },
  ) {
    return this.webhooksService.createWebhook(
      req.user._id.toString(),
      body.url,
      body.events,
      body.secret,
    );
  }

  @Get()
  async getWebhooks(@Request() req) {
    return this.webhooksService.getWebhooksByUser(req.user._id.toString());
  }

  @Get(':id')
  async getWebhookById(@Param('id') id: string, @Request() req) {
    return this.webhooksService.getWebhookById(id, req.user._id.toString());
  }

  @Patch(':id')
  async updateWebhook(
    @Param('id') id: string,
    @Request() req,
    @Body()
    body: Partial<{
      url: string;
      events: WebhookEventType[];
      active: boolean;
      secret?: string;
    }>,
  ) {
    return this.webhooksService.updateWebhook(
      id,
      req.user._id.toString(),
      body,
    );
  }

  @Delete(':id')
  async deleteWebhook(@Param('id') id: string, @Request() req) {
    await this.webhooksService.deleteWebhook(id, req.user._id.toString());
    return { message: 'Webhook deleted successfully' };
  }

  @Post(':id/test')
  async testWebhook(@Param('id') id: string, @Request() req) {
    const webhook = await this.webhooksService.getWebhookById(
      id,
      req.user._id.toString(),
    );

    const testEvent =
      webhook.events.length > 0
        ? webhook.events[0]
        : WebhookEventType.CHAT_STARTED;

    const testPayload = {
      event: testEvent,
      timestamp: new Date().toISOString(),
      chatSessionId: 'test-session-id',
      agentId: 'test-agent-id',
      visitorId: 'test-visitor-id',
      test: true,
    };

    // Send test webhook synchronously to get immediate feedback
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'X-NexaVelosAI-Event': testEvent,
        'X-NexaVelosAI-Timestamp': new Date().toISOString(),
      };

      if (webhook.secret) {
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(testPayload))
          .digest('hex');
        headers['X-NexaVelosAI-Signature'] = signature;
      }

      console.log('Sending test webhook to:', webhook.url);
      const response = await axios.post(webhook.url, testPayload, {
        headers,
        timeout: 10000,
      });
      console.log('Test webhook response status:', response.status);

      webhook.failureCount = 0;
      webhook.lastSuccessAt = new Date();
      await webhook.save();

      return {
        message: 'Webhook test succeeded',
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error('Test webhook failed:', error);
      webhook.failureCount += 1;
      webhook.lastFailureAt = new Date();

      if (webhook.failureCount >= 5) {
        webhook.active = false;
      }

      await webhook.save();

      throw new BadRequestException({
        message: 'Webhook test failed',
        error: error.response?.status || error.code,
        errorMessage: error.response?.statusText || error.message,
      });
    }
  }
}
