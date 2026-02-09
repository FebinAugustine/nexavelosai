import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeamMemberDocument = TeamMember & Document;

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// Permission types for different features
export enum TeamPermission {
  // Team management
  MANAGE_TEAM_SETTINGS = 'manage_team_settings',
  INVITE_MEMBERS = 'invite_members',
  REMOVE_MEMBERS = 'remove_members',
  UPDATE_MEMBER_ROLES = 'update_member_roles',
  DELETE_TEAM = 'delete_team',

  // Agent management
  CREATE_AGENTS = 'create_agents',
  EDIT_AGENTS = 'edit_agents',
  DELETE_AGENTS = 'delete_agents',
  SHARE_AGENTS = 'share_agents',
  VIEW_AGENTS = 'view_agents',

  // Lead management
  VIEW_LEADS = 'view_leads',
  EDIT_LEADS = 'edit_leads',
  DELETE_LEADS = 'delete_leads',

  // Billing
  VIEW_BILLING = 'view_billing',
  MANAGE_BILLING = 'manage_billing',

  // Analytics
  VIEW_ANALYTICS = 'view_analytics',
}

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<TeamRole, TeamPermission[]> = {
  [TeamRole.OWNER]: [
    TeamPermission.MANAGE_TEAM_SETTINGS,
    TeamPermission.INVITE_MEMBERS,
    TeamPermission.REMOVE_MEMBERS,
    TeamPermission.UPDATE_MEMBER_ROLES,
    TeamPermission.DELETE_TEAM,
    TeamPermission.CREATE_AGENTS,
    TeamPermission.EDIT_AGENTS,
    TeamPermission.DELETE_AGENTS,
    TeamPermission.SHARE_AGENTS,
    TeamPermission.VIEW_AGENTS,
    TeamPermission.VIEW_LEADS,
    TeamPermission.EDIT_LEADS,
    TeamPermission.DELETE_LEADS,
    TeamPermission.VIEW_BILLING,
    TeamPermission.MANAGE_BILLING,
    TeamPermission.VIEW_ANALYTICS,
  ],
  [TeamRole.ADMIN]: [
    TeamPermission.MANAGE_TEAM_SETTINGS,
    TeamPermission.INVITE_MEMBERS,
    TeamPermission.REMOVE_MEMBERS,
    TeamPermission.UPDATE_MEMBER_ROLES,
    TeamPermission.CREATE_AGENTS,
    TeamPermission.EDIT_AGENTS,
    TeamPermission.DELETE_AGENTS,
    TeamPermission.SHARE_AGENTS,
    TeamPermission.VIEW_AGENTS,
    TeamPermission.VIEW_LEADS,
    TeamPermission.EDIT_LEADS,
    TeamPermission.DELETE_LEADS,
    TeamPermission.VIEW_BILLING,
    TeamPermission.VIEW_ANALYTICS,
  ],
  [TeamRole.EDITOR]: [
    TeamPermission.CREATE_AGENTS,
    TeamPermission.EDIT_AGENTS,
    TeamPermission.VIEW_AGENTS,
    TeamPermission.VIEW_LEADS,
    TeamPermission.EDIT_LEADS,
    TeamPermission.VIEW_ANALYTICS,
  ],
  [TeamRole.VIEWER]: [
    TeamPermission.VIEW_AGENTS,
    TeamPermission.VIEW_LEADS,
    TeamPermission.VIEW_ANALYTICS,
  ],
};

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
