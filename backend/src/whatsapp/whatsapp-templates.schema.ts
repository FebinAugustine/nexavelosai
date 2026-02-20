import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhatsAppTemplateDocument = WhatsAppTemplate & Document;

@Schema({ timestamps: true })
export class WhatsAppTemplate {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  templateName: string;

  @Prop({ required: true, default: 'en_US' })
  languageCode: string;

  @Prop({ required: true })
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

  @Prop({ required: true })
  components: any[];

  @Prop({ required: true, default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Prop()
  templateId?: string;

  @Prop()
  rejectionReason?: string;

  @Prop()
  lastApprovedAt?: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const WhatsAppTemplateSchema =
  SchemaFactory.createForClass(WhatsAppTemplate);

// Add indexes
WhatsAppTemplateSchema.index({ userId: 1 });
WhatsAppTemplateSchema.index({ templateName: 1, languageCode: 1 });
WhatsAppTemplateSchema.index({ status: 1 });
WhatsAppTemplateSchema.index({ isDeleted: 1 });
