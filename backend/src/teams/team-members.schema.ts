import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeamMemberDocument = TeamMember & Document;

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Schema({ timestamps: true })
export class TeamMember {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  teamId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(TeamRole), required: true })
  role: TeamRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  invitedBy?: Types.ObjectId;

  @Prop()
  invitedAt?: Date;

  @Prop()
  joinedAt?: Date;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);

// Add unique index for user-team combination
TeamMemberSchema.index({ userId: 1, teamId: 1 }, { unique: true });
TeamMemberSchema.index({ teamId: 1, role: 1 });
