import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WebhookEventDocument = WebhookEvent & Document;

export enum WebhookEventStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
}

@Schema({ timestamps: true })
export class WebhookEvent {
  @Prop({ type: Types.ObjectId, ref: 'Webhook', required: true })
  webhookId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true, type: Object })
  payload: any;

  @Prop({ required: true })
  status: WebhookEventStatus;

  @Prop()
  responseStatus?: number;

  @Prop({ type: Object })
  responseBody?: any;

  @Prop()
  errorMessage?: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  deliveredAt?: Date;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

WebhookEventSchema.index({ webhookId: 1, status: 1 });
WebhookEventSchema.index({ userId: 1, createdAt: -1 });
WebhookEventSchema.index({ eventType: 1, createdAt: -1 });
