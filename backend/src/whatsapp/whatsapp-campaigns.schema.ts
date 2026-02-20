import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhatsAppCampaignDocument = WhatsAppCampaign & Document;

@Schema({ timestamps: true })
export class WhatsAppCampaign {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  templateId: string;

  @Prop({ required: true })
  contactList: string[];

  @Prop()
  scheduledAt?: Date;

  @Prop({ required: true, default: 'draft' })
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';

  @Prop({
    type: {
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      read: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    default: () => ({
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
    }),
  })
  metrics: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };

  @Prop()
  sentAt?: Date;

  @Prop()
  pausedAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const WhatsAppCampaignSchema =
  SchemaFactory.createForClass(WhatsAppCampaign);

// Add indexes
WhatsAppCampaignSchema.index({ userId: 1 });
WhatsAppCampaignSchema.index({ status: 1 });
WhatsAppCampaignSchema.index({ scheduledAt: 1 });
WhatsAppCampaignSchema.index({ isDeleted: 1 });
