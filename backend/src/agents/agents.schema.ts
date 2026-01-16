import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AgentDocument = Agent & Document;

@Schema({ timestamps: true })
export class Agent {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  apiKey: string;

  @Prop({ required: true, enum: ['gemini', 'chatgpt', 'openrouter'] })
  provider: string;

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
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
