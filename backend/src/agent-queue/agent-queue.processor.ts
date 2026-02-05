import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway'; // Import EventsGateway
import { AgentsService } from '../agents/agents.service'; // Will need this to call the actual agent processing logic

@Processor('agent-requests')
export class AgentQueueProcessor {
  private readonly logger = new Logger(AgentQueueProcessor.name);

  constructor(
    private readonly eventsGateway: EventsGateway,
    private readonly agentsService: AgentsService, // Inject AgentsService
  ) {}

  @Process('process-agent-request')
  async handleProcessAgentRequest(job: Job<any>) {
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data: ${JSON.stringify(job.data)}`,
    );
    const { agentId, userId, message } = job.data; // Destructure all expected properties from job.data

    try {
      // In a real scenario, this would call the actual agent processing logic from AgentsService
      const agentResult = await this.agentsService.processQueuedAgentRequest(
        agentId,
        userId,
        message,
      );

      this.logger.log(
        `Job ${job.id} processed. Result: ${JSON.stringify(agentResult)}`,
      );

      // Emit result back to the client via WebSocket
      this.logger.log(
        `Emitting agent result to user ${userId} via event agent-result-${userId}`,
      );
      this.eventsGateway.sendToUser(userId, `agent-result-${userId}`, {
        jobId: job.id,
        status: 'completed',
        data: agentResult,
      });

      return agentResult;
    } catch (error) {
      this.logger.error(
        `Failed to process job ${job.id}: ${error.message}`,
        error.stack,
      );
      // Emit an error state back to the client
      this.eventsGateway.sendToUser(userId, `agent-result-${userId}`, {
        jobId: job.id,
        status: 'failed',
        error: error.message,
      });
      throw error; // Re-throw to mark the job as failed in BullMQ
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}...`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(
      `Job ${job.id} of type ${job.name} completed. Result: ${JSON.stringify(result)}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} of type ${job.name} failed: ${error.message}`,
      error.stack,
    );
  }
}
