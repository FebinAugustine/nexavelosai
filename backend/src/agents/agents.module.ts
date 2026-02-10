import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { Agent, AgentSchema } from './agents.schema';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { AgentQueueModule } from '../agent-queue/agent-queue.module';
import { PlanBasedThrottlerGuard } from './plan-based-throttler.guard';
import { ThrottlerModule, ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { User, UserSchema } from '../users/users.schema';
import { LeadsModule } from '../leads/leads.module';
import { TeamsModule } from '../teams/teams.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    CacheModule.register(),
    MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    forwardRef(() => AuthModule),
    EventsModule,
    AgentQueueModule,
    LeadsModule,
    TeamsModule,
    WebhooksModule,
  ],
  providers: [AgentsService, PlanBasedThrottlerGuard],
  controllers: [AgentsController],
  exports: [AgentsService, PlanBasedThrottlerGuard],
})
export class AgentsModule {}
