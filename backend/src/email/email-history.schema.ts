import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EmailStatus {
  SENT = 'sent',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Schema({ timestamps: true })
export class EmailHistory {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  campaignId?: string;

  @Prop({ required: true })
  recipientEmail: string;

  @Prop()
  recipientName?: string;

  @Prop({ required: true })
  subject: string;

  @Prop()
  content?: string;

  @Prop({ enum: EmailStatus, default: EmailStatus.PENDING })
  status: EmailStatus;

  @Prop()
  sentAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop()
  googleAccountId?: string;
}

export type EmailHistoryDocument = EmailHistory & Document;
export const EmailHistorySchema = SchemaFactory.createForClass(EmailHistory);
