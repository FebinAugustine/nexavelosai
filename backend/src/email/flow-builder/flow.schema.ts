import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum FlowNodeType {
  TRIGGER = 'trigger',
  ACTION = 'action',
  CONDITION = 'condition',
  DELAY = 'delay',
  END = 'end',
}

export enum TriggerType {
  NEW_LEAD = 'new_lead',
  EMAIL_RESPONSE = 'email_response',
  LEAD_STATUS_CHANGE = 'lead_status_change',
}

export enum ActionType {
  SEND_EMAIL = 'send_email',
  UPDATE_LEAD_STATUS = 'update_lead_status',
  ADD_TAG = 'add_tag',
  CREATE_TASK = 'create_task',
  WEBHOOK = 'webhook',
}

export enum DelayUnit {
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
}

export enum ConditionType {
  LEAD_STATUS = 'lead_status',
  EMAIL_RESPONSE_CONTENT = 'email_response_content',
  TIME_ELAPSED = 'time_elapsed',
  TAG_EXISTS = 'tag_exists',
}

@Schema({ timestamps: true })
export class EmailFlow {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description?: string;

  @Prop({ type: Object, required: true })
  flowData: {
    nodes: Array<{
      id: string;
      type: FlowNodeType;
      position: { x: number; y: number };
      data: any;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      data: any;
    }>;
  };

  @Prop({ default: 'platform' }) // 'platform', 'user', 'custom'
  aiApiSource: string;

  @Prop()
  customApiKey?: string;

  @Prop()
  customApiProvider?: string; // 'openai', 'gemini', 'anthropic', etc.

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: Object })
  stats?: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    avgProcessingTime: number;
  };
}

export type EmailFlowDocument = EmailFlow & Document;
export const EmailFlowSchema = SchemaFactory.createForClass(EmailFlow);
