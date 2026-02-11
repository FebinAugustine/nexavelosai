import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsV1Controller } from './agents.controller';
import { LeadsV1Controller } from './leads.controller';
import { TeamsV1Controller } from './teams.controller';
import { AnalyticsV1Controller } from './analytics.controller';
import { AgentsModule } from '../../agents/agents.module';
import { LeadsModule } from '../../leads/leads.module';
import { TeamsModule } from '../../teams/teams.module';
import { UsersModule } from '../../users/users.module';
import { AnalyticsModule } from '../../analytics/analytics.module';
import { User, UserSchema } from '../../users/users.schema';
import { Agent, AgentSchema } from '../../agents/agents.schema';
import { Lead, LeadSchema } from '../../leads/leads.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: Lead.name, schema: LeadSchema },
    ]),
    AgentsModule,
    LeadsModule,
    TeamsModule,
    UsersModule,
    AnalyticsModule,
  ],
  controllers: [
    AgentsV1Controller,
    LeadsV1Controller,
    TeamsV1Controller,
    AnalyticsV1Controller,
  ],
})
export class ApiV1Module {}
