import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppAccountService } from './whatsapp-account.service';
import {
  WhatsAppAccount,
  WhatsAppAccountSchema,
} from './whatsapp-account.schema';
import { MetaWhatsAppAPI } from './meta-whatsapp-api';
import { WhatsAppTemplatesService } from './whatsapp-templates.service';
import {
  WhatsAppTemplate,
  WhatsAppTemplateSchema,
} from './whatsapp-templates.schema';
import { WhatsAppCampaignsService } from './whatsapp-campaigns.service';
import {
  WhatsAppCampaign,
  WhatsAppCampaignSchema,
} from './whatsapp-campaigns.schema';
import { WhatsAppChatService } from './whatsapp-chat.service';
import {
  WhatsAppChatSession,
  WhatsAppChatSessionSchema,
} from './whatsapp-chat.schema';
import { WhatsAppAnalyticsService } from './whatsapp-analytics.service';
import {
  WhatsAppAnalytics,
  WhatsAppAnalyticsSchema,
} from './whatsapp-analytics.schema';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [
    ContactsModule,
    MongooseModule.forFeature([
      { name: WhatsAppAccount.name, schema: WhatsAppAccountSchema },
      { name: WhatsAppTemplate.name, schema: WhatsAppTemplateSchema },
      { name: WhatsAppCampaign.name, schema: WhatsAppCampaignSchema },
      { name: WhatsAppChatSession.name, schema: WhatsAppChatSessionSchema },
      { name: WhatsAppAnalytics.name, schema: WhatsAppAnalyticsSchema },
    ]),
  ],
  controllers: [WhatsAppController],
  providers: [
    MetaWhatsAppAPI,
    WhatsAppAccountService,
    WhatsAppTemplatesService,
    WhatsAppCampaignsService,
    WhatsAppChatService,
    WhatsAppAnalyticsService,
  ],
  exports: [
    MetaWhatsAppAPI,
    WhatsAppAccountService,
    WhatsAppTemplatesService,
    WhatsAppCampaignsService,
    WhatsAppChatService,
    WhatsAppAnalyticsService,
  ],
})
export class WhatsAppModule {}
