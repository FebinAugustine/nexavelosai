import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomAgentsService } from './custom-agents.service';
import { CustomAgentsController } from './custom-agents.controller';
import { CustomAgent, CustomAgentSchema } from './custom-agents.schema';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { AgentQueueModule } from '../agent-queue/agent-queue.module';
import { ThrottlerModule, ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { User, UserSchema } from '../users/users.schema';
import { LeadsModule } from '../leads/leads.module';
import { TeamsModule } from '../teams/teams.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { BullModule } from '@nestjs/bull';
import { CustomAgentProcessor } from './custom-agent.processor';

@Module({
  imports: [
    CacheModule.register(),
    MongooseModule.forFeature([
      { name: CustomAgent.name, schema: CustomAgentSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    forwardRef(() => AuthModule),
    EventsModule,
    AgentQueueModule,
    LeadsModule,
    TeamsModule,
    WebhooksModule,
    BullModule.registerQueue({
      name: 'custom-agent-requests',
    }),
  ],
  providers: [CustomAgentsService, CustomAgentProcessor],
  controllers: [CustomAgentsController],
  exports: [CustomAgentsService],
})
export class CustomAgentsModule {}
