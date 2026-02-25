import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailFlow, EmailFlowDocument } from './flow.schema';
import { EventsGateway } from '../../events/events.gateway';
import { FlowContext, FlowExecutionResult } from './types/flow.types';

@Injectable()
export class FlowBuilderService {
  constructor(
    @InjectModel(EmailFlow.name) private flowModel: Model<EmailFlowDocument>,
    private eventsGateway: EventsGateway,
  ) {}

  async createFlow(userId: string, data: any): Promise<EmailFlowDocument> {
    const flow = new this.flowModel({
      userId,
      ...data,
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        avgProcessingTime: 0,
      },
    });
    return flow.save();
  }

  async getFlows(userId: string): Promise<EmailFlowDocument[]> {
    return this.flowModel.find({ userId });
  }

  async getFlow(userId: string, flowId: string): Promise<EmailFlowDocument> {
    const flow = await this.flowModel.findOne({ _id: flowId, userId });
    if (!flow) {
      throw new BadRequestException('Flow not found');
    }
    console.log('Returning flow data:', flow);
    return flow;
  }

  async updateFlow(
    userId: string,
    flowId: string,
    data: any,
  ): Promise<EmailFlowDocument> {
    const updated = await this.flowModel.findByIdAndUpdate(flowId, data, {
      new: true,
    });
    if (!updated) {
      throw new BadRequestException('Flow not found');
    }
    return updated;
  }

  async deleteFlow(userId: string, flowId: string): Promise<void> {
    const result = await this.flowModel.deleteOne({ _id: flowId, userId });
    if (result.deletedCount === 0) {
      throw new BadRequestException('Flow not found');
    }
  }

  async publishFlow(
    userId: string,
    flowId: string,
  ): Promise<EmailFlowDocument> {
    const flow = await this.getFlow(userId, flowId);
    flow.isPublished = true;
    return flow.save();
  }
}
