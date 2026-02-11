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

  @Prop()
  duration?: number; // Total conversation duration in seconds

  @Prop({ type: Number, default: 0 })
  messageCount?: number; // Total messages in session

  @Prop({ type: Number, default: 0 })
  userMessageCount?: number; // User messages count

  @Prop({ type: Number, default: 0 })
  agentMessageCount?: number; // Agent messages count

  @Prop({ type: Number })
  avgResponseTime?: number; // Average response time in milliseconds

  @Prop({ type: [Number] })
  responseTimes?: number[]; // Individual response times

  @Prop()
  country?: string; // Country from IP geolocation

  @Prop()
  city?: string; // City from IP geolocation

  @Prop()
  region?: string; // Region/state from IP geolocation

  @Prop()
  zipCode?: string; // Zip code from IP geolocation

  @Prop({ type: Number })
  latitude?: number; // Latitude coordinate

  @Prop({ type: Number })
  longitude?: number; // Longitude coordinate

  @Prop({ default: false })
  convertedToLead?: boolean; // Whether session resulted in lead

  @Prop()
  exitPage?: string; // Page where conversation ended

  @Prop({ type: Object, default: {} })
  utmParameters?: Record<string, any>; // UTM tracking parameters
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);

// Add indexes for analytics query performance
ChatSessionSchema.index({ userId: 1, createdAt: -1 });
ChatSessionSchema.index({ userId: 1, agentId: 1, createdAt: -1 });
ChatSessionSchema.index({ userId: 1, country: 1 });
ChatSessionSchema.index({ userId: 1, convertedToLead: 1, createdAt: -1 });
