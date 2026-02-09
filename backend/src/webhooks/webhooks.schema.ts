import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WebhookDocument = Webhook & Document;

export enum WebhookEventType {
  CHAT_STARTED = 'chat_started',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  LEAD_CAPTURED = 'lead_captured',
  CHAT_ENDED = 'chat_ended',
  AGENT_CREATED = 'agent_created',
  AGENT_UPDATED = 'agent_updated',
  AGENT_DELETED = 'agent_deleted',
}

@Schema({ timestamps: true })
export class Webhook {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop({
    type: [String],
    enum: Object.values(WebhookEventType),
    required: true,
  })
  events: WebhookEventType[];

  @Prop({ default: true })
  active: boolean;

  @Prop()
  secret?: string;

  @Prop({ default: 0 })
  failureCount: number;

  @Prop()
  lastFailureAt?: Date;

  @Prop()
  lastSuccessAt?: Date;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);

WebhookSchema.index({ userId: 1 });
WebhookSchema.index({ active: 1, events: 1 });
