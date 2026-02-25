import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { ServeStaticModule } from '@nestjs/serve-static';
import { BullModule } from '@nestjs/bull';
import * as redisStore from 'cache-manager-redis-store';
import * as path from 'path';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';
import { CustomAgentsModule } from './custom-agents/custom-agents.module';
import { PaymentsModule } from './payments/payments.module';
import { EventsModule } from './events/events.module';
import { AgentQueueModule } from './agent-queue/agent-queue.module';
import { AdminModule } from './admin/admin.module'; // Import AdminModule
import { LeadsModule } from './leads/leads.module'; // Import Leads module
import { TeamsModule } from './teams/teams.module'; // Import Teams module
import { WebhooksModule } from './webhooks/webhooks.module'; // Import Webhooks module
import { ApiModule } from './api/api.module'; // Import API module
import { AnalyticsModule } from './analytics/analytics.module'; // Import Analytics module
import { EmailModule } from './email/email.module'; // Import Email module
import { WhatsAppModule } from './whatsapp/whatsapp.module'; // Import WhatsApp module
import { ContactsModule } from './contacts/contacts.module'; // Import Contacts module

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: path.resolve(__dirname, '../.env') }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nexavelosai',
    ),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 10 }],
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 300, // 5 minutes default TTL
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
      },
    }),
    PassportModule,
    UsersModule,
    MailModule,
    AuthModule,
    AgentsModule,
    CustomAgentsModule,
    PaymentsModule,
    EventsModule,
    AgentQueueModule,
    AdminModule, // Add AdminModule here
    LeadsModule, // Add Leads module here
    TeamsModule, // Add Teams module here
    WebhooksModule, // Add Webhooks module here
    ApiModule, // Add API module here
    AnalyticsModule, // Add Analytics module here
    EmailModule, // Add Email module here
    WhatsAppModule, // Add WhatsApp module here
    ContactsModule, // Add Contacts module here
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'),
      serveRoot: '/', // Serve static files from root path so widget.js is accessible at /widget.js
      serveStaticOptions: {
        index: false, // Disable serving index.html for root path
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (): Promise<Connection> => {
        const mongoose = await import('mongoose');
        const connection = await mongoose.connect(
          process.env.MONGODB_URI || 'mongodb://localhost:27017/nexavelosai',
        );
        return connection.connection;
      },
    },
  ],
})
export class AppModule {}
