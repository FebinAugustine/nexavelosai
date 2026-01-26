import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { Agent, AgentSchema } from './agents.schema';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { PlanBasedThrottlerGuard } from './plan-based-throttler.guard';
import { ThrottlerModule, ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    CacheModule.register(),
    MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema }]),
    UsersModule,
    forwardRef(() => AuthModule),
    EventsModule,
  ],
  providers: [AgentsService, PlanBasedThrottlerGuard],
  controllers: [AgentsController],
  exports: [AgentsService, PlanBasedThrottlerGuard],
})
export class AgentsModule {}
