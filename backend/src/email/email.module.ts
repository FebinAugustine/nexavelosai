import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { GoogleAccount, GoogleAccountSchema } from './google-account.schema';
import { Contact, ContactSchema } from './contacts.schema';
import { EmailTemplate, EmailTemplateSchema } from './templates.schema';
import { EmailCampaign, EmailCampaignSchema } from './campaigns.schema';
import { GoogleAccountService } from './google-account.service';
import { ContactsService } from './contacts.service';
import { EmailTemplatesService } from './templates.service';
import { EmailCampaignsService } from './campaigns.service';
import { GmailService } from './gmail.service';
import { EmailProcessor } from './email.processor';
import { EmailController } from './email.controller';
import { GoogleAuthController } from '../auth/google-auth.controller';
import { GoogleStrategy } from '../auth/google-auth.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GoogleAccount.name, schema: GoogleAccountSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
      { name: EmailCampaign.name, schema: EmailCampaignSchema },
    ]),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  controllers: [EmailController, GoogleAuthController],
  providers: [
    GoogleAccountService,
    ContactsService,
    EmailTemplatesService,
    EmailCampaignsService,
    GmailService,
    EmailProcessor,
    GoogleStrategy,
  ],
  exports: [
    GoogleAccountService,
    ContactsService,
    EmailTemplatesService,
    EmailCampaignsService,
    GmailService,
  ],
})
export class EmailModule {}
