import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomAgentDocument = CustomAgent & Document;

@Schema({ timestamps: true })
export class CustomAgent {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  apiKey: string;

  @Prop({ required: true, enum: ['gemini', 'chatgpt', 'openrouter', 'custom'] })
  provider: string;

  @Prop({ required: true })
  model: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  configuration: Record<string, any>;

  @Prop()
  domain?: string;

  @Prop({ default: 0 })
  chatCount: number;

  @Prop({ default: 0 })
  totalInteractions: number;

  @Prop({
    type: Object,
    default: {
      enabled: false,
      trigger: 'time',
      triggerValue: 0,
      formFields: [],
    },
  })
  leadCapture: {
    enabled: boolean;
    trigger: 'time' | 'messageCount';
    triggerValue: number;
    formFields: Array<{
      name: string;
      label: string;
      type: 'text' | 'email' | 'phone' | 'textarea';
      required: boolean;
      placeholder?: string;
    }>;
  };
}

export const CustomAgentSchema = SchemaFactory.createForClass(CustomAgent);
