import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { Webhook, WebhookSchema } from './webhooks.schema';
import { WebhookEvent, WebhookEventSchema } from './webhook-events.schema';
import { BullModule } from '@nestjs/bull';
import { WebhookProcessor } from './webhook.processor';
import { Agent, AgentSchema } from '../agents/agents.schema';
import { EventsModule } from '../events/events.module';
import { MailModule } from '../mail/mail.module';
import { User, UserSchema } from '../users/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Webhook.name, schema: WebhookSchema },
      { name: WebhookEvent.name, schema: WebhookEventSchema },
      { name: Agent.name, schema: AgentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    BullModule.registerQueue({
      name: 'webhooks',
    }),
    EventsModule,
    MailModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookProcessor],
  exports: [WebhooksService],
})
export class WebhooksModule {}
