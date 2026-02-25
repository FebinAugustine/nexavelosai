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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { WhatsAppTemplatesService } from './whatsapp-templates.service';
import { WhatsAppCampaignsService } from './whatsapp-campaigns.service';
import { WhatsAppChatService } from './whatsapp-chat.service';
import { WhatsAppAnalyticsService } from './whatsapp-analytics.service';
import { MetaWhatsAppAPI } from './meta-whatsapp-api';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactsService } from '../contacts/contacts.service';
import { ContactListsService } from '../contacts/contact-lists.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly whatsAppAccountService: WhatsAppAccountService,
    private readonly whatsAppTemplatesService: WhatsAppTemplatesService,
    private readonly whatsAppCampaignsService: WhatsAppCampaignsService,
    private readonly whatsAppChatService: WhatsAppChatService,
    private readonly whatsAppAnalyticsService: WhatsAppAnalyticsService,
    private readonly metaWhatsAppAPI: MetaWhatsAppAPI,
    private readonly contactsService: ContactsService,
    private readonly contactListsService: ContactListsService,
  ) {}

  // Contacts endpoints
  @UseGuards(JwtAuthGuard)
  @Post('contacts')
  async createContact(@Request() req, @Body() body) {
    return this.contactsService.createContact(req.user._id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('contacts/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'text/csv' ||
          file.originalname.endsWith('.csv') ||
          file.mimetype.includes('excel') ||
          file.mimetype.includes('spreadsheet') ||
          file.originalname.endsWith('.xlsx') ||
          file.originalname.endsWith('.xls')
        ) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV and Excel files are accepted'), false);
        }
      },
    }),
  )
  async uploadContacts(@Request() req, @UploadedFile() file) {
    try {
      const fs = require('fs');
      let results: any[] = [];

      if (file.originalname.endsWith('.csv')) {
        // Parse CSV file
        const csvParser = require('csv-parser');
        await new Promise((resolve, reject) => {
          fs.createReadStream(file.path)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => {
              fs.unlinkSync(file.path);
              resolve(results);
            })
            .on('error', (error) => {
              fs.unlinkSync(file.path);
              reject(error);
            });
        });
      } else {
        // Parse Excel file
        const xlsx = require('xlsx');
        const workbook = xlsx.readFile(file.path);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        results = xlsx.utils.sheet_to_json(firstSheet);
        fs.unlinkSync(file.path);
      }

      const processedContacts = results.map((contact) => ({
        email: contact.email || contact.Email || '',
        firstName: contact.firstName || contact['First Name'] || '',
        lastName: contact.lastName || contact['Last Name'] || '',
        phone: contact.phone || contact.Phone || '',
        tags:
          contact.tags || contact.Tags
            ? contact.tags.split(',').map((tag: string) => tag.trim())
            : [],
      }));

      const result = await this.contactsService.uploadContacts(
        req.user._id,
        processedContacts,
      );

      // Create contact list
      await this.contactListsService.createContactList(
        req.user._id,
        file.originalname,
        processedContacts,
      );

      return {
        message: `Contacts uploaded successfully`,
        ...result,
      };
    } catch (error) {
      console.error('Error parsing CSV file:', error);
      return { message: 'Error parsing CSV file', error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('contacts/lists')
  async getContactLists(@Request() req) {
    return this.contactListsService.getContactLists(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('contacts/lists/:id/preview')
  async getContactListPreview(@Request() req, @Param('id') id: string) {
    return this.contactListsService.getContactListPreview(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('contacts/lists/:id')
  async deleteContactList(@Request() req, @Param('id') id: string) {
    return this.contactListsService.deleteContactList(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('contacts')
  async getContacts(@Request() req, @Query() query) {
    return this.contactsService.getContacts(req.user._id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('contacts/:id')
  async deleteContact(@Request() req, @Param('id') id: string) {
    return this.contactsService.deleteContact(req.user._id, id);
  }

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
