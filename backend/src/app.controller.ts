import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';
import { ContactDto } from './dto/contact.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('contact')
  async contact(@Body() contactDto: ContactDto) {
    try {
      await this.mailService.sendContactEmail(
        contactDto.name,
        contactDto.email,
        contactDto.subject,
        contactDto.message,
      );

      return {
        message: 'Contact email sent successfully!',
        status: HttpStatus.OK,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send contact email. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
