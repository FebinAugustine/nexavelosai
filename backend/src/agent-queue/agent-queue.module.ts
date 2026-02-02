import { Module, forwardRef, Logger } from '@nestjs/common'; // Import Logger
import { BullModule } from '@nestjs/bull';
import { AgentQueueService } from './agent-queue.service';
import { AgentQueueProcessor } from './agent-queue.processor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsModule } from '../events/events.module';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST') || 'localhost';
        const redisPort = configService.get<number>('REDIS_PORT') || 6379;
        const logger = new Logger('BullModule'); // Create a logger instance

        logger.log(`Connecting BullMQ to Redis at ${redisHost}:${redisPort}`); // Log connection details

        return {
          redis: {
            host: redisHost,
            port: redisPort,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'agent-requests',
    }),
    EventsModule, // Add EventsModule
    forwardRef(() => AgentsModule), // Add AgentsModule with forwardRef
  ],
  providers: [AgentQueueService, AgentQueueProcessor],
  exports: [AgentQueueService, BullModule], // Export BullModule for other modules that might need it
})
export class AgentQueueModule {}
