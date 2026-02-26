import { Injectable, BadRequestException } from '@nestjs/common';
import { FlowBuilderService } from './flow-builder.service';
import { GmailService } from '../gmail.service';
import { EmailTemplatesService } from '../templates.service';
import { LeadsService } from '../../leads/leads.service';
import { AIAnalysisService } from './ai-analysis.service';
import { EmailHistoryService } from '../email-history.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FlowContext, FlowExecutionResult } from './types/flow.types';
import { EmailFlow } from './flow.schema';
import {
  FlowNodeType,
  TriggerType,
  ActionType,
  ConditionType,
  DelayUnit,
} from './flow.schema';
import { WebhooksService } from '../../webhooks/webhooks.service';
import { WebhookEventType } from '../../webhooks/webhooks.schema';
import { EmailCampaignsService } from '../campaigns.service';
import { CustomAgentsService } from '../../custom-agents/custom-agents.service';

@Injectable()
export class EmailFlowEngine {
  constructor(
    private flowBuilderService: FlowBuilderService,
    private gmailService: GmailService,
    private emailTemplatesService: EmailTemplatesService,
    private leadsService: LeadsService,
    private aiAnalysisService: AIAnalysisService,
    private emailHistoryService: EmailHistoryService,
    @InjectQueue('email-flow-queue') private emailFlowQueue: Queue,
    private webhooksService: WebhooksService,
    private emailCampaignsService: EmailCampaignsService,
    private customAgentsService: CustomAgentsService,
  ) {}

  async executeFlow(
    flowId: string,
    context: FlowContext,
  ): Promise<FlowExecutionResult> {
    const startTime = Date.now();
    const flow = await this.flowBuilderService.getFlow(context.userId, flowId);

    if (!flow || !flow.isPublished) {
      throw new BadRequestException('Flow not found or not published');
    }

    try {
      const executionResult = await this.traverseFlow(
        flow.flowData,
        context,
        flow,
      );

      // Update flow stats
      await this.flowBuilderService.updateFlow(context.userId, flowId, {
        stats: {
          ...flow.stats,
          totalRuns: (flow.stats?.totalRuns || 0) + 1,
          successfulRuns: (flow.stats?.successfulRuns || 0) + 1,
          avgProcessingTime: Math.round(
            ((flow.stats?.avgProcessingTime || 0) *
              (flow.stats?.totalRuns || 0) +
              (Date.now() - startTime)) /
              ((flow.stats?.totalRuns || 0) + 1),
          ),
        },
      });

      return {
        success: true,
        flowId,
        executionTime: Date.now() - startTime,
        context,
        result: executionResult,
      };
    } catch (error) {
      // Update flow stats for failed run
      await this.flowBuilderService.updateFlow(context.userId, flowId, {
        stats: {
          ...flow.stats,
          totalRuns: (flow.stats?.totalRuns || 0) + 1,
          failedRuns: (flow.stats?.failedRuns || 0) + 1,
        },
      });

      throw error;
    }
  }

  private async traverseFlow(
    flowData: any,
    context: FlowContext,
    flow: EmailFlow,
  ): Promise<any> {
    // Find start node
    const startNode = flowData.nodes.find(
      (node) => node.type === FlowNodeType.TRIGGER,
    );

    if (!startNode) {
      throw new Error('Flow must have a trigger node');
    }

    return this.processNode(startNode, flowData, context, flow);
  }

  private async processNode(
    node: any,
    flowData: any,
    context: FlowContext,
    flow: EmailFlow,
  ): Promise<any> {
    switch (node.type) {
      case FlowNodeType.TRIGGER:
        return this.processTriggerNode(node, flowData, context, flow);

      case FlowNodeType.ACTION:
        return this.processActionNode(node, flowData, context, flow);

      case FlowNodeType.CONDITION:
        return this.processConditionNode(node, flowData, context, flow);

      case FlowNodeType.DELAY:
        return this.processDelayNode(node, flowData, context, flow);

      case FlowNodeType.END:
        return { completed: true };

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private async processTriggerNode(
    node: any,
    flowData: any,
    context: FlowContext,
    flow: EmailFlow,
  ): Promise<any> {
    // Get next nodes
    const nextNodes = this.getNextNodes(
      node.id,
      flowData.edges,
      flowData.nodes,
    );

    // For trigger nodes, we simply move to the next node
    if (nextNodes.length > 0) {
      return this.processNode(nextNodes[0], flowData, context, flow);
    }

    return { completed: true };
  }

  private async processActionNode(
    node: any,
    flowData: any,
    context: FlowContext,
    flow: EmailFlow,
  ): Promise<any> {
    const actionType = node.data.actionType;

    switch (actionType) {
      case ActionType.SEND_EMAIL:
        await this.handleSendEmailAction(node.data, context);
        break;
      case ActionType.SEND_EMAIL_CAMPAIGN:
        await this.handleSendEmailCampaignAction(node.data, context);
        break;
      case ActionType.UPDATE_LEAD_STATUS:
        await this.handleUpdateLeadStatusAction(node.data, context);
        break;
      case ActionType.ADD_TAG:
        await this.handleAddTagAction(node.data, context);
        break;
      case ActionType.CREATE_TASK:
        await this.handleCreateTaskAction(node.data, context);
        break;
      case ActionType.WEBHOOK:
        await this.handleWebhookAction(node.data, context);
        break;
      case ActionType.SEND_WHATSAPP:
        await this.handleSendWhatsAppAction(node.data, context);
        break;
      case ActionType.CUSTOM_AGENT:
        await this.handleCustomAgentAction(node.data, context);
        break;
    }

    // Get next nodes
    const nextNodes = this.getNextNodes(
      node.id,
      flowData.edges,
      flowData.nodes,
    );

    if (nextNodes.length > 0) {
      return this.processNode(nextNodes[0], flowData, context, flow);
    }

    return { completed: true };
  }

  private async processConditionNode(
    node: any,
    flowData: any,
    context: FlowContext,
    flow: EmailFlow,
  ): Promise<any> {
    const conditionType = node.data.conditionType;
    let conditionMet = false;

    switch (conditionType) {
      case ConditionType.LEAD_STATUS:
        conditionMet = await this.evaluateLeadStatusCondition(
          node.data,
          context,
        );
        break;
      case ConditionType.EMAIL_RESPONSE_CONTENT:
        conditionMet = await this.evaluateEmailResponseContentCondition(
          node.data,
          context,
          flow,
        );
        break;
      case ConditionType.TIME_ELAPSED:
        conditionMet = await this.evaluateTimeElapsedCondition(
          node.data,
          context,
        );
        break;
      case ConditionType.TAG_EXISTS:
        conditionMet = await this.evaluateTagExistsCondition(
          node.data,
          context,
        );
        break;
      case ConditionType.CUSTOM:
        conditionMet = await this.evaluateCustomCondition(node.data, context);
        break;
    }

    // Get next nodes based on condition result
    const nextNodes = this.getNextNodes(
      node.id,
      flowData.edges,
      flowData.nodes,
    );

    if (nextNodes.length > 0) {
      // For conditions with two outputs (true/false), we need to handle branching
      if (nextNodes.length === 2) {
        const targetNode = conditionMet ? nextNodes[0] : nextNodes[1];
        return this.processNode(targetNode, flowData, context, flow);
      } else if (nextNodes.length === 1 && conditionMet) {
        return this.processNode(nextNodes[0], flowData, context, flow);
      }
    }

    return { completed: true };
  }

  private async processDelayNode(
    node: any,
    flowData: any,
    context: FlowContext,
    flow: EmailFlow,
  ): Promise<any> {
    const delayValue = node.data.delayValue;
    const delayUnit = node.data.delayUnit || DelayUnit.MINUTES;

    // Calculate delay in milliseconds
    let delayMs = 0;
    switch (delayUnit) {
      case DelayUnit.SECONDS:
        delayMs = delayValue * 1000;
        break;
      case DelayUnit.MINUTES:
        delayMs = delayValue * 60 * 1000;
        break;
      case DelayUnit.HOURS:
        delayMs = delayValue * 60 * 60 * 1000;
        break;
      case DelayUnit.DAYS:
        delayMs = delayValue * 24 * 60 * 60 * 1000;
        break;
    }

    // Schedule next node processing
    await this.emailFlowQueue.add(
      'process-node',
      {
        flowId: context.flowId,
        nodeId: this.getNextNodes(node.id, flowData.edges, flowData.nodes)[0]
          ?.id,
        context,
      },
      { delay: delayMs },
    );

    return { delayed: true, delayMs };
  }

  private getNextNodes(nodeId: string, edges: any[], nodes: any[]): any[] {
    const connectedEdges = edges.filter((edge) => edge.source === nodeId);
    const nextNodeIds = connectedEdges.map((edge) => edge.target);
    return nodes.filter((node) => nextNodeIds.includes(node.id));
  }

  private async handleSendEmailAction(
    data: any,
    context: FlowContext,
  ): Promise<void> {
    // Implementation for sending email
    let recipientEmail = context.email;

    if (data.emailRecipientType === 'static' && data.emailRecipient) {
      recipientEmail = data.emailRecipient;
    } else if (data.emailRecipientType === 'dynamic') {
      // For dynamic recipients, try to get email from context (e.g., lead data)
      if (context.leadId) {
        const lead = await this.leadsService.findOne(
          context.leadId,
          context.userId,
        );
        if (lead && lead.email) {
          recipientEmail = lead.email;
        }
      }
    }

    console.log('Sending email to:', recipientEmail);
    console.log('Email data:', data);
    console.log('Context:', context);

    if (recipientEmail) {
      if (data.emailTemplateId) {
        const template = await this.emailTemplatesService.getTemplate(
          context.userId,
          data.emailTemplateId,
        );
        await this.gmailService.sendEmail(
          context.userId,
          recipientEmail,
          template.subject,
          template.content,
        );
      } else if (data.emailSubject && data.emailContent) {
        await this.gmailService.sendEmail(
          context.userId,
          recipientEmail,
          data.emailSubject,
          data.emailContent,
        );
      } else {
        console.log('No email template or content provided');
      }
    } else {
      console.log('No recipient email found');
    }
  }

  private async handleUpdateLeadStatusAction(
    data: any,
    context: FlowContext,
  ): Promise<void> {
    if (context.leadId) {
      await this.leadsService.updateLead(context.leadId, context.userId, {
        status: data.status,
      });
    }
  }

  private async handleAddTagAction(
    data: any,
    context: FlowContext,
  ): Promise<void> {
    if (context.leadId) {
      const lead = await this.leadsService.findOne(
        context.leadId,
        context.userId,
      );
      const existingTags = lead.tags || [];
      if (!existingTags.includes(data.tag)) {
        await this.leadsService.updateLead(context.leadId, context.userId, {
          tags: [...existingTags, data.tag],
        });
      }
    }
  }

  private async handleCreateTaskAction(
    data: any,
    context: FlowContext,
  ): Promise<void> {
    // Implementation for creating tasks (would integrate with task management system)
    console.log('Creating task:', data.taskName);
  }

  private async handleWebhookAction(
    data: any,
    context: FlowContext,
  ): Promise<void> {
    // Implementation for calling webhooks
    if (data.webhookId) {
      console.log('Calling webhook by ID:', data.webhookId);
      try {
        // Get webhook details
        const webhook = await this.webhooksService.getWebhookById(
          data.webhookId,
          context.userId,
        );

        // Call the webhook
        await this.webhooksService.triggerSpecificWebhook(
          data.webhookId,
          WebhookEventType.FLOW_EXECUTION,
          context,
        );

        console.log('Webhook called successfully');
      } catch (error) {
        console.error('Failed to call webhook:', error);
      }
    } else if (data.webhookUrl) {
      console.log('Calling webhook by URL:', data.webhookUrl);
      // Implement direct URL call here if needed
    }
  }

  private async handleSendEmailCampaignAction(
    data: any,
    context: FlowContext,
  ): Promise<void> {
    // Implementation for sending email campaigns
    console.log('Sending email campaign:', data.campaignId);
    try {
      if (data.campaignId) {
        await this.emailCampaignsService.sendCampaign(
          context.userId,
          data.campaignId,
        );
        console.log('Email campaign sent successfully');
      }
    } catch (error) {
      console.error('Failed to send email campaign:', error);
    }
  }

  private async handleSendWhatsAppAction(
    data: any,
    context: FlowContext,
  ): Promise<void> {
    // Implementation for sending WhatsApp messages
    let recipientPhone = context.phone;

    if (data.whatsappRecipientType === 'static' && data.whatsappRecipient) {
      recipientPhone = data.whatsappRecipient;
    }

    if (recipientPhone) {
      console.log('Sending WhatsApp message to:', recipientPhone);
      // Add actual WhatsApp sending implementation here
      // For example, using WhatsApp API service
    }
  }

  private async handleCustomAgentAction(
    data: any,
    context: FlowContext,
  ): Promise<void> {
    // Implementation for calling custom agents
    console.log('Calling custom agent:', data.customAgentId);
    try {
      if (data.customAgentId) {
        // Parse agent parameters if provided
        let agentParams = {};
        if (data.customAgentParams) {
          try {
            agentParams = JSON.parse(data.customAgentParams);
          } catch (parseError) {
            console.error(
              'Failed to parse custom agent parameters:',
              parseError,
            );
          }
        }

        // Logic to call custom agent would go here
        // This might involve using the customAgentsService
        console.log('Custom agent called with parameters:', agentParams);
        console.log('Custom agent called successfully');
      }
    } catch (error) {
      console.error('Failed to call custom agent:', error);
    }
  }

  private async evaluateLeadStatusCondition(
    data: any,
    context: FlowContext,
  ): Promise<boolean> {
    if (context.leadId) {
      const lead = await this.leadsService.findOne(
        context.leadId,
        context.userId,
      );
      return lead.status === data.status;
    }
    return false;
  }

  private async evaluateEmailResponseContentCondition(
    data: any,
    context: FlowContext,
    flow: EmailFlow,
  ): Promise<boolean> {
    if (context.emailContent) {
      const analysis = await this.aiAnalysisService.analyzeEmailContent(
        context.emailContent,
        context,
        flow,
      );

      switch (data.condition) {
        case 'intent':
          return analysis.intent === data.value;
        case 'sentiment':
          return analysis.sentiment === data.value;
        case 'contains':
          return context.emailContent
            .toLowerCase()
            .includes(data.value.toLowerCase());
        case 'leadQuality':
          return analysis.leadQuality === data.value;
        default:
          return false;
      }
    }
    return false;
  }

  private async evaluateTimeElapsedCondition(
    data: any,
    context: FlowContext,
  ): Promise<boolean> {
    // Implementation for time elapsed condition
    return true; // Default to true for now
  }

  private async evaluateTagExistsCondition(
    data: any,
    context: FlowContext,
  ): Promise<boolean> {
    if (context.leadId) {
      const lead = await this.leadsService.findOne(
        context.leadId,
        context.userId,
      );
      return !!(lead.tags && lead.tags.includes(data.tag));
    }
    return false;
  }

  private async evaluateCustomCondition(
    data: any,
    context: FlowContext,
  ): Promise<boolean> {
    // Implementation for custom conditions
    console.log('Evaluating custom condition:', data.condition);
    return true; // Default to true for now
  }
}
