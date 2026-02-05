import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ type: Date, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt?: Date;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  agentId: Types.ObjectId;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  name?: string;

  @Prop()
  company?: string;

  @Prop()
  website?: string;

  @Prop({ type: Object, default: {} })
  customFields?: Record<string, any>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ChatSession' }], default: [] })
  chatSessions: Types.ObjectId[];

  @Prop({ default: 'new' }) // new, contacted, qualified, converted, lost
  status: string;

  @Prop()
  notes?: string;

  @Prop()
  tags?: string[];
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Add indexes for performance
LeadSchema.index({ userId: 1, status: 1 });
LeadSchema.index({ userId: 1, createdAt: -1 });
