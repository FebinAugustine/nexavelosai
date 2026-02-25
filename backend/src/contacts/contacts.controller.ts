import {
  Controller,
  Get,
  Post,
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
import { ContactsService } from './contacts.service';
import { ContactListsService } from './contact-lists.service';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly contactListsService: ContactListsService,
  ) {}

  // Contacts endpoints
  @Post()
  async createContact(@Request() req, @Body() body) {
    return this.contactsService.createContact(req.user._id, body);
  }

  @Post('upload')
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
            .on('error', reject);
        });
      } else if (
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')
      ) {
        // Parse Excel file
        const xlsx = require('xlsx');
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        results = xlsx.utils.sheet_to_json(worksheet);
        fs.unlinkSync(file.path);
      } else {
        fs.unlinkSync(file.path);
        throw new Error('Unsupported file format');
      }

      // Create contact list and save contacts
      const contactList = await this.contactListsService.createContactList(
        req.user._id,
        file.originalname,
        results,
      );

      return {
        success: true,
        message: `Successfully uploaded ${contactList.contactCount} contacts to list "${file.originalname}"`,
        data: contactList,
      };
    } catch (error) {
      console.error('Error uploading contacts:', error);
      return {
        success: false,
        message: error.message || 'Failed to upload contacts',
      };
    }
  }

  @Get()
  async getContacts(@Request() req, @Query() query) {
    return this.contactsService.getContacts(req.user._id, query.filters || {});
  }

  @Get('lists')
  async getContactLists(@Request() req) {
    return this.contactListsService.getContactLists(req.user._id);
  }

  @Get('lists/:id/preview')
  async getContactListPreview(@Request() req, @Param('id') id: string) {
    return this.contactListsService.getContactListPreview(req.user._id, id);
  }

  @Delete('lists/:id')
  async deleteContactList(@Request() req, @Param('id') id: string) {
    await this.contactListsService.deleteContactList(req.user._id, id);
    return { message: 'Contact list deleted successfully' };
  }
}
