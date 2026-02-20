import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhatsAppChatSessionDocument = WhatsAppChatSession & Document;

@Schema({ timestamps: true })
export class WhatsAppChatSession {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  from: string;

  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ default: [] })
  messages: Array<{
    messageId: string;
    type: 'text' | 'template' | 'interactive' | 'media';
    content: any;
    sender: 'user' | 'bot';
    timestamp: Date;
    status?: 'sent' | 'delivered' | 'read' | 'failed';
  }>;

  @Prop({ default: Date.now })
  lastActive: Date;

  @Prop({ default: 'active' })
  status: 'active' | 'closed';

  @Prop({ type: Object, default: {} })
  metadata: any;
}

export const WhatsAppChatSessionSchema =
  SchemaFactory.createForClass(WhatsAppChatSession);

// Add indexes
WhatsAppChatSessionSchema.index({ userId: 1 });
WhatsAppChatSessionSchema.index({ sessionId: 1 });
WhatsAppChatSessionSchema.index({ from: 1 });
WhatsAppChatSessionSchema.index({ lastActive: 1 });
WhatsAppChatSessionSchema.index({ status: 1 });
