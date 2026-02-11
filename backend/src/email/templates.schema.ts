import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EmailTemplate {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 'basic' })
  type: string;

  @Prop({ type: Object })
  variables?: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;
}

export type EmailTemplateDocument = EmailTemplate & Document;
export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
