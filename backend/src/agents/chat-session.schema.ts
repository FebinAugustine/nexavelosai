import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatSessionDocument = ChatSession & Document;

export class ChatMessage {
  @Prop({ required: true })
  role: 'user' | 'agent';

  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  timestamp?: Date;
}

@Schema({ timestamps: true })
export class ChatSession {
  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  agentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lead' })
  leadId?: Types.ObjectId;

  @Prop({ default: 'active' }) // active, ended
  status: string;

  @Prop()
  visitorId?: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  referringUrl?: string;

  @Prop()
  pageUrl?: string;

  @Prop({ type: [Object], default: [] })
  messages: ChatMessage[];
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);
