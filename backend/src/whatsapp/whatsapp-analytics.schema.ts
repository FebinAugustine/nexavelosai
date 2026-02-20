import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhatsAppAnalyticsDocument = WhatsAppAnalytics & Document;

@Schema({ timestamps: true })
export class WhatsAppAnalytics {
  @Prop({ required: true })
  userId: string;

  @Prop()
  campaignId?: string;

  @Prop()
  messageId?: string;

  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  status: 'sent' | 'delivered' | 'read' | 'failed';

  @Prop({ required: true })
  timestamp: Date;

  @Prop()
  responseTime?: number;

  @Prop()
  errorMessage?: string;

  @Prop()
  templateName?: string;

  @Prop()
  messageType?: 'text' | 'template' | 'interactive' | 'media';
}

export const WhatsAppAnalyticsSchema =
  SchemaFactory.createForClass(WhatsAppAnalytics);

// Add indexes
WhatsAppAnalyticsSchema.index({ userId: 1 });
WhatsAppAnalyticsSchema.index({ campaignId: 1 });
WhatsAppAnalyticsSchema.index({ messageId: 1 });
WhatsAppAnalyticsSchema.index({ status: 1 });
WhatsAppAnalyticsSchema.index({ timestamp: 1 });
WhatsAppAnalyticsSchema.index({ templateName: 1 });
