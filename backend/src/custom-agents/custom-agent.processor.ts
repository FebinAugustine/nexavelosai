import {
  Process,
  Processor,
  OnQueueFailed,
  OnQueueError,
  OnQueueCompleted,
  OnQueueActive,
} from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bull';
import { CustomAgent, CustomAgentDocument } from './custom-agents.schema';
import { Logger } from '@nestjs/common';
import { CustomAgentsService } from './custom-agents.service';
import { EventsGateway } from '../events/events.gateway';

@Processor('custom-agent-requests')
export class CustomAgentProcessor {
  private readonly logger = new Logger(CustomAgentProcessor.name);

  constructor(
    @InjectModel(CustomAgent.name)
    private customAgentModel: Model<CustomAgentDocument>,
    private customAgentsService: CustomAgentsService,
    private eventsGateway: EventsGateway,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.data.action} for custom agent ${job.data.agentId}`,
    );
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(
      `Job ${job.id} completed for custom agent ${job.data.agentId}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed for custom agent ${job.data.agentId}: ${error.message}`,
      error.stack,
    );
  }

  @OnQueueError()
  onError(error: Error) {
    this.logger.error(`Queue error: ${error.message}`, error.stack);
  }

  @Process('increment-chat-count')
  async handleIncrementChatCount(job: Job) {
    const { agentId } = job.data;
    this.logger.log(`Processing increment chat count for agent: ${agentId}`);

    try {
      await this.customAgentModel
        .findByIdAndUpdate(agentId, { $inc: { chatCount: 1 } })
        .exec();

      this.logger.log(
        `Successfully incremented chat count for agent: ${agentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error incrementing chat count for agent ${agentId}: ${error.message}`,
      );
      throw error;
    }
  }

  @Process('increment-total-interactions')
  async handleIncrementTotalInteractions(job: Job) {
    const { agentId } = job.data;
    this.logger.log(
      `Processing increment total interactions for agent: ${agentId}`,
    );

    try {
      await this.customAgentModel
        .findByIdAndUpdate(agentId, { $inc: { totalInteractions: 1 } })
        .exec();

      this.logger.log(
        `Successfully incremented total interactions for agent: ${agentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error incrementing total interactions for agent ${agentId}: ${error.message}`,
      );
      throw error;
    }
  }

  @Process('process-custom-agent-request')
  async handleProcessCustomAgentRequest(job: Job) {
    const { agentId, action, data, userId, message, chatSessionId } = job.data;
    this.logger.log(
      `Processing custom agent request: ${action} for agent: ${agentId}`,
    );

    try {
      switch (action) {
        case 'incrementChatCount':
          await this.handleIncrementChatCount(job);
          break;
        case 'incrementTotalInteractions':
          await this.handleIncrementTotalInteractions(job);
          break;
        case 'chat':
          await this.handleChat(job);
          break;
        default:
          this.logger.warn(`Unknown action: ${action}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing custom agent request: ${error.message}`,
      );
      throw error;
    }
  }

  private async handleChat(job: Job) {
    try {
      const { agentId, userId, message, chatSessionId } = job.data;

      this.logger.debug(
        `Processing chat for custom agent ${agentId}, user ${userId}, session ${chatSessionId}`,
      );

      const responseText =
        await this.customAgentsService.processQueuedCustomAgentRequest(
          agentId,
          userId,
          message,
          chatSessionId,
        );

      // Send response via WebSocket
      if (userId) {
        this.eventsGateway.sendToUser(userId, `custom-agent-result-${userId}`, {
          jobId: job.id,
          chatSessionId,
          status: 'completed',
          data: responseText,
        });
      }

      this.logger.debug(`Chat completed for custom agent ${agentId}`);
    } catch (error: any) {
      this.logger.error(
        `Error processing chat for custom agent ${job.data.agentId}: ${error.message}`,
        error.stack,
      );

      if (job.data.userId) {
        this.eventsGateway.sendToUser(
          job.data.userId,
          `custom-agent-result-${job.data.userId}`,
          {
            jobId: job.id,
            chatSessionId: job.data.chatSessionId,
            status: 'error',
            error:
              error.message ||
              'Sorry, there was an error processing your request.',
          },
        );
      }

      throw error;
    }
  }
}
