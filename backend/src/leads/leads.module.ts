import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { Lead, LeadSchema } from './leads.schema';
import { ChatSession, ChatSessionSchema } from '../agents/chat-session.schema';
import { Agent, AgentSchema } from '../agents/agents.schema';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { TeamsModule } from '../teams/teams.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
    ]),
    MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema }]),
    CacheModule.register(),
    TeamsModule, // Import TeamsModule to resolve TeamsService dependency
    WebhooksModule, // Import WebhooksModule to resolve WebhooksService dependency
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
