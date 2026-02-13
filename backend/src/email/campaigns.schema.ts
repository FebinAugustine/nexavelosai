import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

@Schema({ timestamps: true })
export class EmailCampaign {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  templateId?: string;

  @Prop({ required: true })
  contactIds: string[];

  @Prop()
  googleAccountId?: string;

  @Prop({ default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Prop()
  scheduledAt?: Date;

  @Prop({ type: Object })
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

export type EmailCampaignDocument = EmailCampaign & Document;
export const EmailCampaignSchema = SchemaFactory.createForClass(EmailCampaign);
