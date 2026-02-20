import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { WhatsAppTemplatesService } from './whatsapp-templates.service';
import { WhatsAppCampaignsService } from './whatsapp-campaigns.service';
import { WhatsAppChatService } from './whatsapp-chat.service';
import { WhatsAppAnalyticsService } from './whatsapp-analytics.service';
import { MetaWhatsAppAPI } from './meta-whatsapp-api';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly whatsAppAccountService: WhatsAppAccountService,
    private readonly whatsAppTemplatesService: WhatsAppTemplatesService,
    private readonly whatsAppCampaignsService: WhatsAppCampaignsService,
    private readonly whatsAppChatService: WhatsAppChatService,
    private readonly whatsAppAnalyticsService: WhatsAppAnalyticsService,
    private readonly metaWhatsAppAPI: MetaWhatsAppAPI,
  ) {}

  // Account management
  @UseGuards(JwtAuthGuard)
  @Post('accounts/connect')
  async connectAccount(@Request() req, @Body() body: any) {
    const user = req.user;
    return this.whatsAppAccountService.connectAccount(user._id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accounts/disconnect')
  async disconnectAccount(@Request() req) {
    const user = req.user;
    return this.whatsAppAccountService.disconnectAccount(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('accounts')
  async getAccounts(@Request() req) {
    const user = req.user;
    return this.whatsAppAccountService.getByUserId(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('accounts')
  async updateAccount(@Request() req, @Body() body: any) {
    const user = req.user;
    return this.whatsAppAccountService.updateAccount(user._id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('accounts')
  async deleteAccount(@Request() req) {
    const user = req.user;
    return this.whatsAppAccountService.deleteAccount(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accounts/validate')
  async validateAccount(@Request() req) {
    const user = req.user;
    return this.whatsAppAccountService.validateAccount(user._id);
  }

  // Templates management
  @UseGuards(JwtAuthGuard)
  @Get('templates')
  async getTemplates(@Request() req) {
    const user = req.user;
    return this.whatsAppTemplatesService.getTemplates(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('templates/:id')
  async getTemplate(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppTemplatesService.getTemplateById(user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('templates')
  async createTemplate(@Request() req, @Body() body: any) {
    const user = req.user;
    return this.whatsAppTemplatesService.createTemplate(user._id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('templates/:id')
  async updateTemplate(
    @Request() req,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = req.user;
    return this.whatsAppTemplatesService.updateTemplate(user._id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('templates/:id')
  async deleteTemplate(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppTemplatesService.deleteTemplate(user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('templates/sync')
  async syncTemplates(@Request() req) {
    const user = req.user;
    return this.whatsAppTemplatesService.syncTemplates(user._id);
  }

  // Campaigns management
  @UseGuards(JwtAuthGuard)
  @Get('campaigns')
  async getCampaigns(@Request() req) {
    const user = req.user;
    return this.whatsAppCampaignsService.getCampaigns(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('campaigns/:id')
  async getCampaign(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppCampaignsService.getCampaignById(user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('campaigns')
  async createCampaign(@Request() req, @Body() body: any) {
    const user = req.user;
    return this.whatsAppCampaignsService.createCampaign(user._id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('campaigns/:id')
  async updateCampaign(
    @Request() req,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = req.user;
    return this.whatsAppCampaignsService.updateCampaign(user._id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('campaigns/:id')
  async deleteCampaign(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppCampaignsService.deleteCampaign(user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('campaigns/:id/send')
  async sendCampaign(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppCampaignsService.sendCampaign(user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('campaigns/:id/schedule')
  async scheduleCampaign(
    @Request() req,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = req.user;
    return this.whatsAppCampaignsService.scheduleCampaign(
      user._id,
      id,
      body.scheduledAt,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('campaigns/:id/pause')
  async pauseCampaign(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppCampaignsService.pauseCampaign(user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('campaigns/:id/resume')
  async resumeCampaign(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppCampaignsService.resumeCampaign(user._id, id);
  }

  // Chat management
  @UseGuards(JwtAuthGuard)
  @Get('chats')
  async getChatSessions(@Request() req) {
    const user = req.user;
    return this.whatsAppChatService.getChatSessions(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chats/:id')
  async getChatSession(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppChatService.getChatSessionById(user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chats/by-number/:number')
  async getChatSessionByNumber(
    @Request() req,
    @Param('number') number: string,
  ) {
    const user = req.user;
    return this.whatsAppChatService.getChatSessionByFromNumber(
      user._id,
      number,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('chats/:id/messages')
  async sendMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const user = req.user;
    return this.whatsAppChatService.sendMessage(user._id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chats/:id/close')
  async closeChatSession(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppChatService.closeChatSession(user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chats/:id/history')
  async getChatHistory(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppChatService.getChatHistory(user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('chats/:id')
  async deleteChatSession(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppChatService.deleteChatSession(user._id, id);
  }

  // Analytics
  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getOverallAnalytics(@Request() req) {
    const user = req.user;
    return this.whatsAppAnalyticsService.getOverallAnalytics(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/campaigns/:id')
  async getCampaignAnalytics(@Request() req, @Param('id') id: string) {
    const user = req.user;
    return this.whatsAppAnalyticsService.getCampaignAnalytics(user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/contacts')
  async getContactAnalytics(@Request() req) {
    const user = req.user;
    return this.whatsAppAnalyticsService.getContactAnalytics(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/period')
  async getAnalyticsByPeriod(
    @Request() req,
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'week',
  ) {
    const user = req.user;
    return this.whatsAppAnalyticsService.getAnalyticsByPeriod(user._id, period);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/templates')
  async getTemplatePerformance(@Request() req) {
    const user = req.user;
    return this.whatsAppAnalyticsService.getTemplatePerformance(user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics/export')
  async exportAnalytics(
    @Request() req,
    @Query('format') format: 'csv' | 'json' = 'json',
  ) {
    const user = req.user;
    return this.whatsAppAnalyticsService.exportAnalytics(user._id, format);
  }

  // Webhook endpoint for Meta WhatsApp API
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    if (body['hub.mode'] && body['hub.verify_token'] && body['hub.challenge']) {
      // Webhook verification
      return this.metaWhatsAppAPI.verifyWebhook(
        body['hub.mode'],
        body['hub.verify_token'],
        body['hub.challenge'],
      );
    } else {
      // Webhook event processing
      const event = await this.metaWhatsAppAPI.parseWebhookEvent(body);
      if (event) {
        // Handle message or status event
        if (event.eventType === 'message') {
          // TODO: Find user by from number and handle message
          console.log('Incoming message:', event);
        } else if (event.type === 'status') {
          // TODO: Find message and update status
          console.log('Message status update:', event);
        }
      }
      return { status: 'ok' };
    }
  }
}
