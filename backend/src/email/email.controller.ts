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
import { ContactListsService } from './contact-lists.service';
import { EmailTemplatesService } from './templates.service';
import { EmailCampaignsService } from './campaigns.service';
import { EmailHistoryService } from './email-history.service';

@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(
    private readonly googleAccountService: GoogleAccountService,
    private readonly contactsService: ContactsService,
    private readonly contactListsService: ContactListsService,
    private readonly emailTemplatesService: EmailTemplatesService,
    private readonly emailCampaignsService: EmailCampaignsService,
    private readonly emailHistoryService: EmailHistoryService,
  ) {}

  // Google Account endpoints
  @Get('accounts')
  async getGoogleAccounts(@Request() req) {
    return this.googleAccountService.getByUserId(req.user._id);
  }

  @Delete('accounts/:id')
  async disconnectGoogleAccount(@Request() req, @Param('id') id: string) {
    return this.googleAccountService.disconnect(req.user._id, id);
  }

  @Put('accounts/:id/default')
  async setDefaultAccount(@Request() req, @Param('id') id: string) {
    return this.googleAccountService.setDefault(req.user._id, id);
  }

  // Contacts endpoints
  @Post('contacts')
  async createContact(@Request() req, @Body() body) {
    return this.contactsService.createContact(req.user._id, body);
  }

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

  @Get('contacts/lists')
  async getContactLists(@Request() req) {
    return this.contactListsService.getContactLists(req.user._id);
  }

  @Get('contacts/lists/:id/preview')
  async getContactListPreview(@Request() req, @Param('id') id: string) {
    return this.contactListsService.getContactListPreview(req.user._id, id);
  }

  @Delete('contacts/lists/:id')
  async deleteContactList(@Request() req, @Param('id') id: string) {
    return this.contactListsService.deleteContactList(req.user._id, id);
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

  // Email History endpoints
  @Get('history')
  async getEmailHistory(@Request() req, @Query() query) {
    return this.emailHistoryService.getEmailHistory(req.user._id, query);
  }

  @Delete('history/:id')
  async deleteEmailHistory(@Request() req, @Param('id') id: string) {
    return this.emailHistoryService.deleteEmailHistory(id);
  }
}
