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
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookEventType } from './webhooks.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgencyPlanGuard } from './agency-plan.guard';

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

    await this.webhooksService.triggerWebhook(WebhookEventType.CHAT_STARTED, {
      event: WebhookEventType.CHAT_STARTED,
      timestamp: new Date().toISOString(),
      chatSessionId: 'test-session-id',
      agentId: 'test-agent-id',
      visitorId: 'test-visitor-id',
      test: true,
    });

    return { message: 'Webhook test triggered' };
  }
}
