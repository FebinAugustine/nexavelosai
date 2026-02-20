import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhatsAppAccountDocument = WhatsAppAccount & Document;

@Schema({ timestamps: true })
export class WhatsAppAccount {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  phoneNumberId: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  businessName: string;

  @Prop()
  whatsappBusinessAccountId?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  webhookUrl?: string;

  @Prop()
  webhookVerifyToken?: string;

  @Prop()
  qualityRating?: 'GREEN' | 'YELLOW' | 'RED';

  @Prop()
  messageLimit?: number;

  @Prop()
  messageCount?: number;
}

export const WhatsAppAccountSchema =
  SchemaFactory.createForClass(WhatsAppAccount);

// Add indexes
WhatsAppAccountSchema.index({ userId: 1 });
WhatsAppAccountSchema.index({ phoneNumber: 1 });
WhatsAppAccountSchema.index({ isActive: 1 });
