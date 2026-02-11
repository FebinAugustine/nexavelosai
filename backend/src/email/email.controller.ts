import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoogleAccountService } from './google-account.service';
import { ContactsService } from './contacts.service';
import { EmailTemplatesService } from './templates.service';
import { EmailCampaignsService } from './campaigns.service';

@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(
    private readonly googleAccountService: GoogleAccountService,
    private readonly contactsService: ContactsService,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly emailCampaignsService: EmailCampaignsService,
  ) {}

  // Google Account endpoints
  @Get('accounts')
  async getGoogleAccount(@Request() req) {
    return this.googleAccountService.getByUserId(req.user._id);
  }

  @Delete('accounts')
  async disconnectGoogleAccount(@Request() req) {
    return this.googleAccountService.disconnect(req.user._id);
  }

  // Contacts endpoints
  @Post('contacts')
  async createContact(@Request() req, @Body() body) {
    return this.contactsService.createContact(req.user._id, body);
  }

  @Post('contacts/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadContacts(@Request() req, @UploadedFile() file) {
    // TODO: Implement file parsing (CSV, Excel)
    return { message: 'File upload not implemented yet' };
  }

  @Get('contacts')
  async getContacts(@Request() req, @Query() query) {
    return this.contactsService.getContacts(req.user._id, query);
  }

  @Delete('contacts/:id')
  async deleteContact(@Request() req, @Param('id') id: string) {
    return this.contactsService.deleteContact(req.user._id, id);
  }

  // Email Templates endpoints
  @Post('templates')
  async createTemplate(@Request() req, @Body() body) {
    return this.emailTemplatesService.createTemplate(req.user._id, body);
  }

  @Get('templates')
  async getTemplates(@Request() req) {
    return this.emailTemplatesService.getTemplates(req.user._id);
  }

  @Get('templates/:id')
  async getTemplate(@Request() req, @Param('id') id: string) {
    return this.emailTemplatesService.getTemplate(req.user._id, id);
  }

  @Put('templates/:id')
  async updateTemplate(@Request() req, @Param('id') id: string, @Body() body) {
    return this.emailTemplatesService.updateTemplate(req.user._id, id, body);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Request() req, @Param('id') id: string) {
    return this.emailTemplatesService.deleteTemplate(req.user._id, id);
  }

  // Campaigns endpoints
  @Post('campaigns')
  async createCampaign(@Request() req, @Body() body) {
    return this.emailCampaignsService.createCampaign(req.user._id, body);
  }

  @Get('campaigns')
  async getCampaigns(@Request() req) {
    return this.emailCampaignsService.getCampaigns(req.user._id);
  }

  @Get('campaigns/:id')
  async getCampaign(@Request() req, @Param('id') id: string) {
    return this.emailCampaignsService.getCampaign(req.user._id, id);
  }

  @Put('campaigns/:id')
  async updateCampaign(@Request() req, @Param('id') id: string, @Body() body) {
    return this.emailCampaignsService.updateCampaign(req.user._id, id, body);
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Request() req, @Param('id') id: string) {
    return this.emailCampaignsService.deleteCampaign(req.user._id, id);
  }

  @Post('campaigns/:id/send')
  async sendCampaign(@Request() req, @Param('id') id: string) {
    return this.emailCampaignsService.sendCampaign(req.user._id, id);
  }
}
