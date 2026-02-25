import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AgentQueueService {
  constructor(
    @InjectQueue('agent-requests') private agentQueue: Queue,
    @InjectQueue('custom-agent-requests') private customAgentQueue: Queue,
  ) {}

  async addAgentRequest(data: any) {
    // Add a job to the 'agent-requests' queue
    const job = await this.agentQueue.add('process-agent-request', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    return job;
  }

  async addCustomAgentRequest(data: any) {
    // Add a job to the 'custom-agent-requests' queue
    const job = await this.customAgentQueue.add(
      'process-custom-agent-request',
      data,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
    return job;
  }
}
