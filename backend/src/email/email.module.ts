import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { GoogleAccount, GoogleAccountSchema } from './google-account.schema';
import { EmailTemplate, EmailTemplateSchema } from './templates.schema';
import { EmailCampaign, EmailCampaignSchema } from './campaigns.schema';
import { EmailHistory, EmailHistorySchema } from './email-history.schema';
import { EmailFlow, EmailFlowSchema } from './flow-builder/flow.schema';
import { GoogleAccountService } from './google-account.service';
import { EmailTemplatesService } from './templates.service';
import { EmailCampaignsService } from './campaigns.service';
import { EmailHistoryService } from './email-history.service';
import { EmailAnalyticsService } from './email-analytics.service';
import { GmailService } from './gmail.service';
import { EmailProcessor } from './email.processor';
import { EmailController } from './email.controller';
import { GoogleStrategy } from '../auth/google-auth.strategy';
import { EventsModule } from '../events/events.module';
import { ContactsModule } from '../contacts/contacts.module';
import { FlowBuilderService } from './flow-builder/flow-builder.service';
import { EmailFlowEngine } from './flow-builder/email-flow-engine.service';
import { AIAnalysisService } from './flow-builder/ai-analysis.service';
import { EmailFlowProcessor } from './flow-builder/email-flow.processor';
import { LeadsModule } from '../leads/leads.module';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    EventsModule,
    ContactsModule,
    LeadsModule,
    AgentsModule,
    MongooseModule.forFeature([
      { name: GoogleAccount.name, schema: GoogleAccountSchema },
      { name: EmailTemplate.name, schema: EmailTemplateSchema },
      { name: EmailCampaign.name, schema: EmailCampaignSchema },
      { name: EmailHistory.name, schema: EmailHistorySchema },
      { name: EmailFlow.name, schema: EmailFlowSchema },
    ]),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    BullModule.registerQueue({
      name: 'email-flow-queue',
    }),
  ],
  controllers: [EmailController],
  providers: [
    GoogleAccountService,
    EmailTemplatesService,
    EmailCampaignsService,
    EmailHistoryService,
    EmailAnalyticsService,
    GmailService,
    EmailProcessor,
    GoogleStrategy,
    FlowBuilderService,
    EmailFlowEngine,
    AIAnalysisService,
    EmailFlowProcessor,
  ],
  exports: [
    GoogleAccountService,
    EmailTemplatesService,
    EmailCampaignsService,
    EmailHistoryService,
    EmailAnalyticsService,
    GmailService,
    FlowBuilderService,
    EmailFlowEngine,
  ],
})
export class EmailModule {}
