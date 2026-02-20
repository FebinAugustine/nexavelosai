import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { GoogleAccount, GoogleAccountSchema } from './google-account.schema';
import { Contact, ContactSchema } from './contacts.schema';
import { ContactList, ContactListSchema } from './contact-lists.schema';
import { EmailTemplate, EmailTemplateSchema } from './templates.schema';
import { EmailCampaign, EmailCampaignSchema } from './campaigns.schema';
import { EmailHistory, EmailHistorySchema } from './email-history.schema';
import { GoogleAccountService } from './google-account.service';
import { ContactsService } from './contacts.service';
import { ContactListsService } from './contact-lists.service';
import { EmailTemplatesService } from './templates.service';
import { EmailCampaignsService } from './campaigns.service';
import { EmailHistoryService } from './email-history.service';
import { GmailService } from './gmail.service';
import { EmailProcessor } from './email.processor';
import { EmailController } from './email.controller';
import { GoogleStrategy } from '../auth/google-auth.strategy';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    EventsModule,
    MongooseModule.forFeature([
      { name: GoogleAccount.name, schema: GoogleAccountSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: ContactList.name, schema: ContactListSchema },
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
      { name: EmailCampaign.name, schema: EmailCampaignSchema },
      { name: EmailHistory.name, schema: EmailHistorySchema },
    ]),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
  ],
  controllers: [EmailController],
  providers: [
    GoogleAccountService,
    ContactsService,
    ContactListsService,
    EmailTemplatesService,
    EmailCampaignsService,
    EmailHistoryService,
    GmailService,
    EmailProcessor,
    GoogleStrategy,
  ],
  exports: [
    GoogleAccountService,
    ContactsService,
    ContactListsService,
    EmailTemplatesService,
    EmailCampaignsService,
    EmailHistoryService,
    GmailService,
  ],
})
export class EmailModule {}
