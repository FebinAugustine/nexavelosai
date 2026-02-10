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
  Query,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookEventType } from './webhooks.schema';
import { WebhookEventStatus } from './webhook-events.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgencyPlanGuard } from './agency-plan.guard';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('api/webhooks')
@UseGuards(JwtAuthGuard, AgencyPlanGuard)
@ApiTags('Webhooks')
@ApiBearerAuth()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new webhook' })
  @ApiResponse({ status: 201, description: 'Webhook created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Agency plan required' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Webhook URL' },
        events: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of events to subscribe to',
        },
        secret: {
          type: 'string',
          description: 'Secret for signature verification (optional)',
        },
        domain: {
          type: 'string',
          description: 'Domain to filter events by (optional)',
        },
        agentId: {
          type: 'string',
          description: 'Agent ID to filter events by (optional)',
        },
      },
      required: ['url', 'events'],
    },
  })
  async createWebhook(
    @Request() req,
    @Body()
    body: {
      url: string;
      events: WebhookEventType[];
      secret?: string;
      domain?: string;
      agentId?: string;
    },
  ) {
    return this.webhooksService.createWebhook(
      req.user._id.toString(),
      body.url,
      body.events,
      body.secret,
      body.domain,
      body.agentId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all webhooks for the current user' })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Agency plan required' })
  async getWebhooks(@Request() req) {
    return this.webhooksService.getWebhooksByUser(req.user._id.toString());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single webhook by ID' })
  @ApiResponse({ status: 200, description: 'Webhook details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Agency plan required' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiParam({ name: 'id', type: 'string', description: 'Webhook ID' })
  async getWebhookById(@Param('id') id: string, @Request() req) {
    return this.webhooksService.getWebhookById(id, req.user._id.toString());
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Agency plan required' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiParam({ name: 'id', type: 'string', description: 'Webhook ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Webhook URL' },
        events: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of events to subscribe to',
        },
        active: { type: 'boolean', description: 'Webhook active status' },
        secret: {
          type: 'string',
          description: 'Secret for signature verification (optional)',
        },
        domain: {
          type: 'string',
          description: 'Domain to filter events by (optional)',
        },
        agentId: {
          type: 'string',
          description: 'Agent ID to filter events by (optional)',
        },
      },
    },
  })
  async updateWebhook(
    @Param('id') id: string,
    @Request() req,
    @Body()
    body: Partial<{
      url: string;
      events: WebhookEventType[];
      active: boolean;
      secret?: string;
      domain?: string;
      agentId?: string;
    }>,
  ) {
    return this.webhooksService.updateWebhook(
      id,
      req.user._id.toString(),
      body,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Agency plan required' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiParam({ name: 'id', type: 'string', description: 'Webhook ID' })
  async deleteWebhook(@Param('id') id: string, @Request() req) {
    await this.webhooksService.deleteWebhook(id, req.user._id.toString());
    return { message: 'Webhook deleted successfully' };
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook test succeeded' })
  @ApiResponse({ status: 400, description: 'Webhook test failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Agency plan required' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiParam({ name: 'id', type: 'string', description: 'Webhook ID' })
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

  @Get(':id/events')
  @ApiOperation({ summary: 'Get webhook events by webhook ID' })
  @ApiResponse({ status: 200, description: 'List of webhook events' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Agency plan required' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  @ApiParam({ name: 'id', type: 'string', description: 'Webhook ID' })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'status',
    type: 'string',
    required: false,
    description: 'Event status (success/failure/pending)',
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    required: false,
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    required: false,
    description: 'End date (ISO format)',
  })
  async getWebhookEvents(
    @Param('id') id: string,
    @Request() req,
    @Query() query: any,
  ) {
    return this.webhooksService.getWebhookEventsByWebhookId(
      id,
      req.user._id.toString(),
      query,
    );
  }

  @Get('events')
  @ApiOperation({ summary: 'Get all webhook events for current user' })
  @ApiResponse({ status: 200, description: 'List of all webhook events' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Agency plan required' })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'status',
    type: 'string',
    required: false,
    description: 'Event status (success/failure/pending)',
  })
  @ApiQuery({
    name: 'eventType',
    type: 'string',
    required: false,
    description: 'Event type',
  })
  @ApiQuery({
    name: 'startDate',
    type: 'string',
    required: false,
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    type: 'string',
    required: false,
    description: 'End date (ISO format)',
  })
  async getAllWebhookEvents(@Request() req, @Query() query: any) {
    return this.webhooksService.getWebhookEventsByUserId(
      req.user._id.toString(),
      query,
    );
  }

  @Get('events/:eventId')
  @ApiOperation({ summary: 'Get webhook event by ID' })
  @ApiResponse({ status: 200, description: 'Webhook event details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Agency plan required' })
  @ApiResponse({ status: 404, description: 'Webhook event not found' })
  @ApiParam({
    name: 'eventId',
    type: 'string',
    description: 'Webhook event ID',
  })
  async getWebhookEventById(@Param('eventId') eventId: string, @Request() req) {
    return this.webhooksService.getWebhookEventById(
      eventId,
      req.user._id.toString(),
    );
  }
}
