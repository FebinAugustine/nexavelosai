import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AgentQueueService {
  constructor(@InjectQueue('agent-requests') private agentQueue: Queue) {}

  async addAgentRequest(data: any) {
    // Add a job to the 'agent-requests' queue
    // We can add options like delay, attempts, backoff strategies here
    const job = await this.agentQueue.add('process-agent-request', data, {
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 1000, // Initial delay of 1 second, then 2s, 4s, etc.
      },
    });
    return job;
  }
}
