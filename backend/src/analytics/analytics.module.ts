import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ChatSession, ChatSessionSchema } from '../agents/chat-session.schema';
import { Lead, LeadSchema } from '../leads/leads.schema';
import { Agent, AgentSchema } from '../agents/agents.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatSession.name, schema: ChatSessionSchema },
      { name: Lead.name, schema: LeadSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
