import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Agent' }], default: [] })
  sharedAgents: Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);

// Add indexes for performance
TeamSchema.index({ ownerId: 1 });
TeamSchema.index({ name: 1, ownerId: 1 }, { unique: true });
