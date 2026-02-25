import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailFlowEngine } from './email-flow-engine.service';
import { FlowBuilderService } from './flow-builder.service';
import { FlowContext } from './types/flow.types';

@Processor('email-flow-queue')
export class EmailFlowProcessor {
  constructor(
    private emailFlowEngine: EmailFlowEngine,
    private flowBuilderService: FlowBuilderService,
  ) {}

  @Process('process-node')
  async handleProcessNode(job: Job): Promise<void> {
    const {
      flowId,
      nodeId,
      context,
    }: { flowId: string; nodeId: string; context: FlowContext } = job.data;

    try {
      // Get the flow
      const flow = await this.flowBuilderService.getFlow(
        context.userId,
        flowId,
      );

      if (!flow || !flow.isPublished) {
        console.log(`Flow ${flowId} is not published or does not exist`);
        return;
      }

      // Find the specific node to process
      const node = flow.flowData.nodes.find((n) => n.id === nodeId);

      if (!node) {
        console.log(`Node ${nodeId} not found in flow ${flowId}`);
        return;
      }

      // Execute the flow from the specific node
      await this.emailFlowEngine.executeFlow(flowId, context);
    } catch (error) {
      console.error(
        `Error processing node ${nodeId} in flow ${flowId}:`,
        error,
      );
    }
  }
}
