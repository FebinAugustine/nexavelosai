# Team Collaboration Features Implementation Plan

## Feature Overview

Add team management and collaboration features for agency users. Allow inviting team members, assigning roles, and sharing agents with role-based access control (RBAC).

**Business Value**: Enables agencies to collaborate on client projects, share responsibility for chatbot management, and provides enterprise-grade role-based access control.

**Target Users**: Digital marketing agencies, teams managing multiple chatbots, enterprise users requiring RBAC.

## Implementation Timeline

**Total Estimated Time**: 4-5 weeks

## Phase 1: Database Design & Backend Setup (1 week)

### 1.1 Team Schema Design

```typescript
// backend/src/teams/teams.schema.ts (new file)

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: "" })
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [] })
  members: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: "Agent" }], default: [] })
  sharedAgents: Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);

// Add indexes for performance
TeamSchema.index({ ownerId: 1 });
TeamSchema.index({ name: 1, ownerId: 1 }, { unique: true });
```

### 1.2 Team Member Schema Design

```typescript
// backend/src/teams/team-members.schema.ts (new file)

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type TeamMemberDocument = TeamMember & Document;

export enum TeamRole {
  OWNER = "owner",
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
}

@Schema({ timestamps: true })
export class TeamMember {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Team", required: true })
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
```

### 1.3 Invitation Schema Design

```typescript
// backend/src/teams/invitations.schema.ts (new file)

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type InvitationDocument = Invitation & Document;

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

@Schema({ timestamps: true })
export class Invitation {
  @Prop({ type: Types.ObjectId, ref: "Team", required: true })
  teamId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({
    type: String,
    enum: Object.values(TeamRole),
    default: TeamRole.VIEWER,
  })
  role: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  invitedBy: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({
    type: String,
    enum: Object.values(InvitationStatus),
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Prop()
  expiresAt?: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);

// Add indexes for performance
InvitationSchema.index({ token: 1 });
InvitationSchema.index({ email: 1, teamId: 1 });
InvitationSchema.index({ status: 1, expiresAt: 1 });
```

### 1.4 Extend User Schema

```typescript
// backend/src/users/users.schema.ts

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationCode?: string;

  @Prop()
  verificationCodeExpires?: Date;

  @Prop({ default: "free" }) // free, regular, special, agency
  plan: string;

  @Prop({ default: 1 })
  agentLimit: number;

  @Prop({ default: [] })
  domains: string[];

  @Prop({ default: "user" }) // user, admin
  role: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Agent" }], default: [] })
  agents: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: "Team" }], default: [] })
  teams: Types.ObjectId[];

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add index for teams
UserSchema.index({ teams: 1 });
```

### 1.5 Teams Module Setup

```typescript
// backend/src/teams/teams.module.ts (new file)

import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";
import { Team, TeamSchema } from "./teams.schema";
import { TeamMember, TeamMemberSchema } from "./team-members.schema";
import { Invitation, InvitationSchema } from "./invitations.schema";
import { UsersModule } from "../users/users.module";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    MongooseModule.forFeature([
      { name: TeamMember.name, schema: TeamMemberSchema },
    ]),
    MongooseModule.forFeature([
      { name: Invitation.name, schema: InvitationSchema },
    ]),
    UsersModule,
    MailModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
```

### 1.6 Teams Service & Controller

```typescript
// backend/src/teams/teams.service.ts (new file)

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as crypto from "crypto";
import { Team, TeamDocument } from "./teams.schema";
import {
  TeamMember,
  TeamMemberDocument,
  TeamRole,
} from "./team-members.schema";
import {
  Invitation,
  InvitationDocument,
  InvitationStatus,
} from "./invitations.schema";
import { User, UserDocument } from "../users/users.schema";
import { MailService } from "../mail/mail.service";

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(TeamMember.name)
    private teamMemberModel: Model<TeamMemberDocument>,
    @InjectModel(Invitation.name)
    private invitationModel: Model<InvitationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailService: MailService,
  ) {}

  // Team management operations
  async createTeam(
    ownerId: string,
    name: string,
    description?: string,
  ): Promise<TeamDocument> {
    // Check if user already has a team with this name
    const existingTeam = await this.teamModel.findOne({ ownerId, name });
    if (existingTeam) {
      throw new BadRequestException("Team with this name already exists");
    }

    const team = new this.teamModel({
      ownerId,
      name,
      description,
      members: [new Types.ObjectId(ownerId)],
    });

    const savedTeam = await team.save();

    // Add owner as team member with owner role
    await this.teamMemberModel.create({
      userId: ownerId,
      teamId: savedTeam._id,
      role: TeamRole.OWNER,
      isActive: true,
      joinedAt: new Date(),
    });

    // Add team to user's teams array
    await this.userModel.findByIdAndUpdate(ownerId, {
      $push: { teams: savedTeam._id },
    });

    return savedTeam;
  }

  async getTeamsByUser(userId: string): Promise<TeamDocument[]> {
    const user = await this.userModel.findById(userId).populate("teams");
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user.teams as unknown as TeamDocument[];
  }

  async getTeamById(teamId: string): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId).populate("members");
    if (!team) {
      throw new NotFoundException("Team not found");
    }
    return team;
  }

  async updateTeam(
    teamId: string,
    userId: string,
    updateData: any,
  ): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException("Team not found");
    }

    // Check if user has permission to update team (owner or admin)
    const teamMember = await this.teamMemberModel.findOne({
      userId,
      teamId,
      role: { $in: [TeamRole.OWNER, TeamRole.ADMIN] },
    });

    if (!teamMember) {
      throw new ForbiddenException(
        "You do not have permission to update this team",
      );
    }

    const updatedTeam = await this.teamModel.findByIdAndUpdate(
      teamId,
      updateData,
      { new: true },
    );
    return updatedTeam;
  }

  async deleteTeam(teamId: string, userId: string): Promise<void> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException("Team not found");
    }

    // Check if user is team owner
    if (team.ownerId.toString() !== userId) {
      throw new ForbiddenException("Only team owner can delete the team");
    }

    // Delete all team members
    await this.teamMemberModel.deleteMany({ teamId });

    // Delete all pending invitations
    await this.invitationModel.deleteMany({ teamId });

    // Remove team from all users' teams array
    await this.userModel.updateMany(
      { teams: teamId },
      { $pull: { teams: teamId } },
    );

    // Delete the team
    await this.teamModel.findByIdAndDelete(teamId);
  }

  // Team member management
  async inviteMember(
    teamId: string,
    inviterId: string,
    email: string,
    role: TeamRole = TeamRole.VIEWER,
  ): Promise<InvitationDocument> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException("Team not found");
    }

    // Check if inviter has permission to invite
    const inviter = await this.teamMemberModel.findOne({
      userId: inviterId,
      teamId,
      role: { $in: [TeamRole.OWNER, TeamRole.ADMIN] },
    });

    if (!inviter) {
      throw new ForbiddenException(
        "You do not have permission to invite members",
      );
    }

    // Check if email is already in team
    const existingMember = await this.teamMemberModel.findOne({
      teamId,
      userId: await this.userModel.findOne({ email }).select("_id"),
    });

    if (existingMember) {
      throw new BadRequestException("User is already a member of this team");
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await this.invitationModel.findOne({
      teamId,
      email,
      status: InvitationStatus.PENDING,
    });

    if (existingInvitation) {
      throw new BadRequestException(
        "An invitation already exists for this email",
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = new this.invitationModel({
      teamId,
      email,
      role,
      invitedBy: inviterId,
      invitedAt: new Date(),
      token,
      status: InvitationStatus.PENDING,
      expiresAt,
    });

    const savedInvitation = await invitation.save();

    // Send invitation email
    const inviteLink = `http://localhost:3000/teams/invite/${token}`;
    await this.mailService.sendTeamInvitationEmail(
      email,
      team.name,
      inviteLink,
      expiresAt,
    );

    return savedInvitation;
  }

  async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await this.invitationModel.findOne({
      token,
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      throw new BadRequestException("Invalid or expired invitation");
    }

    // Check if user is already a member
    const existingMember = await this.teamMemberModel.findOne({
      userId,
      teamId: invitation.teamId,
    });

    if (existingMember) {
      throw new BadRequestException("User is already a member of this team");
    }

    // Add user as team member
    await this.teamMemberModel.create({
      userId,
      teamId: invitation.teamId,
      role: invitation.role,
      isActive: true,
      invitedBy: invitation.invitedBy,
      invitedAt: invitation.invitedAt,
      joinedAt: new Date(),
    });

    // Add team to user's teams array
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { teams: invitation.teamId },
    });

    // Update invitation status
    await this.invitationModel.findByIdAndUpdate(invitation._id, {
      status: InvitationStatus.ACCEPTED,
    });

    // Add team to the user's teams list
    await this.teamModel.findByIdAndUpdate(invitation.teamId, {
      $push: { members: userId },
    });
  }

  async rejectInvitation(token: string, userId: string): Promise<void> {
    const invitation = await this.invitationModel.findOne({
      token,
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      throw new BadRequestException("Invalid or expired invitation");
    }

    // Update invitation status
    await this.invitationModel.findByIdAndUpdate(invitation._id, {
      status: InvitationStatus.REJECTED,
    });
  }

  async removeMember(
    teamId: string,
    adminId: string,
    memberId: string,
  ): Promise<void> {
    // Check if admin has permission
    const admin = await this.teamMemberModel.findOne({
      userId: adminId,
      teamId,
      role: { $in: [TeamRole.OWNER, TeamRole.ADMIN] },
    });

    if (!admin) {
      throw new ForbiddenException(
        "You do not have permission to remove members",
      );
    }

    // Check if trying to remove owner
    const memberToRemove = await this.teamMemberModel.findOne({
      userId: memberId,
      teamId,
    });

    if (!memberToRemove) {
      throw new NotFoundException("Member not found");
    }

    if (memberToRemove.role === TeamRole.OWNER) {
      throw new BadRequestException("Cannot remove team owner");
    }

    // Remove member from team
    await this.teamMemberModel.deleteOne({ userId: memberId, teamId });

    // Remove team from user's teams array
    await this.userModel.findByIdAndUpdate(memberId, {
      $pull: { teams: teamId },
    });

    // Remove user from team's members array
    await this.teamModel.findByIdAndUpdate(teamId, {
      $pull: { members: memberId },
    });
  }

  async updateMemberRole(
    teamId: string,
    adminId: string,
    memberId: string,
    newRole: TeamRole,
  ): Promise<TeamMemberDocument> {
    // Check if admin has permission
    const admin = await this.teamMemberModel.findOne({
      userId: adminId,
      teamId,
      role: { $in: [TeamRole.OWNER, TeamRole.ADMIN] },
    });

    if (!admin) {
      throw new ForbiddenException(
        "You do not have permission to update roles",
      );
    }

    // Check if trying to change owner's role
    const member = await this.teamMemberModel.findOne({
      userId: memberId,
      teamId,
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    if (member.role === TeamRole.OWNER) {
      throw new BadRequestException("Cannot change team owner role");
    }

    const updatedMember = await this.teamMemberModel.findOneAndUpdate(
      { userId: memberId, teamId },
      { role: newRole },
      { new: true },
    );

    return updatedMember;
  }

  // Agent sharing
  async shareAgent(
    teamId: string,
    userId: string,
    agentId: string,
  ): Promise<void> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException("Team not found");
    }

    // Check if user has permission to share agents
    const teamMember = await this.teamMemberModel.findOne({
      userId,
      teamId,
      role: { $in: [TeamRole.OWNER, TeamRole.ADMIN] },
    });

    if (!teamMember) {
      throw new ForbiddenException(
        "You do not have permission to share agents",
      );
    }

    // Add agent to shared agents
    await this.teamModel.findByIdAndUpdate(teamId, {
      $addToSet: { sharedAgents: agentId },
    });
  }

  async unshareAgent(
    teamId: string,
    userId: string,
    agentId: string,
  ): Promise<void> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException("Team not found");
    }

    // Check if user has permission to unshare agents
    const teamMember = await this.teamMemberModel.findOne({
      userId,
      teamId,
      role: { $in: [TeamRole.OWNER, TeamRole.ADMIN] },
    });

    if (!teamMember) {
      throw new ForbiddenException(
        "You do not have permission to unshare agents",
      );
    }

    // Remove agent from shared agents
    await this.teamModel.findByIdAndUpdate(teamId, {
      $pull: { sharedAgents: agentId },
    });
  }

  async getSharedAgents(teamId: string, userId: string): Promise<any[]> {
    // Check if user is a member of the team
    const teamMember = await this.teamMemberModel.findOne({
      userId,
      teamId,
    });

    if (!teamMember) {
      throw new ForbiddenException("You are not a member of this team");
    }

    const team = await this.teamModel.findById(teamId).populate("sharedAgents");
    return team.sharedAgents;
  }

  // Role-based access control
  async checkAccess(
    userId: string,
    teamId: string,
    requiredRoles: TeamRole[],
  ): Promise<boolean> {
    const teamMember = await this.teamMemberModel.findOne({
      userId,
      teamId,
      isActive: true,
    });

    if (!teamMember) {
      return false;
    }

    return requiredRoles.includes(teamMember.role as TeamRole);
  }
}
```

```typescript
// backend/src/teams/teams.controller.ts (new file)

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { TeamRole } from "./team-members.schema";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("teams")
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // Team management
  @Post()
  createTeam(
    @Request() req,
    @Body() body: { name: string; description?: string },
  ) {
    return this.teamsService.createTeam(
      req.user.sub,
      body.name,
      body.description,
    );
  }

  @Get()
  getTeams(@Request() req) {
    return this.teamsService.getTeamsByUser(req.user.sub);
  }

  @Get(":id")
  getTeamById(@Param("id") id: string) {
    return this.teamsService.getTeamById(id);
  }

  @Patch(":id")
  updateTeam(
    @Param("id") id: string,
    @Request() req,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.teamsService.updateTeam(id, req.user.sub, body);
  }

  @Delete(":id")
  deleteTeam(@Param("id") id: string, @Request() req) {
    return this.teamsService.deleteTeam(id, req.user.sub);
  }

  // Team members
  @Post(":id/invite")
  inviteMember(
    @Param("id") teamId: string,
    @Request() req,
    @Body() body: { email: string; role?: string },
  ) {
    return this.teamsService.inviteMember(
      teamId,
      req.user.sub,
      body.email,
      body.role as TeamRole,
    );
  }

  @Post("invite/:token/accept")
  acceptInvitation(@Param("token") token: string, @Request() req) {
    return this.teamsService.acceptInvitation(token, req.user.sub);
  }

  @Post("invite/:token/reject")
  rejectInvitation(@Param("token") token: string, @Request() req) {
    return this.teamsService.rejectInvitation(token, req.user.sub);
  }

  @Delete(":teamId/members/:memberId")
  removeMember(
    @Param("teamId") teamId: string,
    @Param("memberId") memberId: string,
    @Request() req,
  ) {
    return this.teamsService.removeMember(teamId, req.user.sub, memberId);
  }

  @Patch(":teamId/members/:memberId/role")
  updateMemberRole(
    @Param("teamId") teamId: string,
    @Param("memberId") memberId: string,
    @Request() req,
    @Body() body: { role: string },
  ) {
    return this.teamsService.updateMemberRole(
      teamId,
      req.user.sub,
      memberId,
      body.role as TeamRole,
    );
  }

  // Agent sharing
  @Post(":id/share")
  shareAgent(
    @Param("id") teamId: string,
    @Request() req,
    @Body() body: { agentId: string },
  ) {
    return this.teamsService.shareAgent(teamId, req.user.sub, body.agentId);
  }

  @Delete(":id/share/:agentId")
  unshareAgent(
    @Param("id") teamId: string,
    @Param("agentId") agentId: string,
    @Request() req,
  ) {
    return this.teamsService.unshareAgent(teamId, req.user.sub, agentId);
  }

  @Get(":id/shared-agents")
  getSharedAgents(@Param("id") teamId: string, @Request() req) {
    return this.teamsService.getSharedAgents(teamId, req.user.sub);
  }
}
```

### 1.7 Extend App Module

```typescript
// backend/src/app.module.ts

@Module({
  imports: [
    // ... existing imports
    TeamsModule, // Add new Teams module
  ],
  // ...
})
export class AppModule {}
```

## Phase 2: Email Service Extension (0.5 weeks)

### 2.1 Add Team Invitation Email

```typescript
// backend/src/mail/mail.service.ts

import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  // ... existing methods

  async sendTeamInvitationEmail(
    email: string,
    teamName: string,
    inviteLink: string,
    expiresAt: Date,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      // SMTP configuration
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `You're invited to join ${teamName} on NexaVelosAI`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #007bff;">You're Invited!</h1>
          <p>You have been invited to join the <strong>${teamName}</strong> team on NexaVelosAI.</p>
          <p>Click the link below to accept your invitation:</p>
          <p style="text-align: center;">
            <a href="${inviteLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Accept Invitation
            </a>
          </p>
          <p>This invitation will expire on ${expiresAt.toLocaleDateString()} at ${expiresAt.toLocaleTimeString()}.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>Best regards,<br>The NexaVelosAI Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}
```

## Phase 3: Frontend Development (2 weeks)

### 3.1 Teams Page Component

```typescript
// frontend/app/dashboard/teams/page.tsx (new file)

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import CreateTeamModal from "./CreateTeamModal";
import TeamDetailsModal from "./TeamDetailsModal";

interface Team {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  sharedAgents: string[];
  createdAt: string;
  updatedAt: string;
}

export default function TeamsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const fetchTeams = async () => {
    const response = await fetch("/api/teams", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch teams");
    }

    return response.json();
  };

  const { data: teams = [], isLoading, error } = useQuery<Team[]>({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (teamData: { name: string; description?: string }) => {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setIsCreateModalOpen(false);
      toast.success("Team created successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateTeam = (teamData: { name: string; description?: string }) => {
    createTeamMutation.mutate(teamData);
  };

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsDetailsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-8">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team._id}
            className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {team.name}
              </h3>
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {team.ownerId === user?.id ? "Owner" : "Member"}
              </span>
            </div>
            {team.description && (
              <p className="text-sm text-gray-600 mb-4">{team.description}</p>
            )}
            <div className="border-t border-gray-200 pt-4">
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Members</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {team.members.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Shared Agents</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {team.sharedAgents.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-5 flex justify-end space-x-3">
              <button
                onClick={() => handleViewTeam(team)}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTeam}
      />

      <TeamDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        team={selectedTeam}
      />
    </div>
  );
}
```

### 3.2 Create Team Modal

```typescript
// frontend/app/dashboard/teams/CreateTeamModal.tsx (new file)

"use client";

import { useState } from "react";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (teamData: { name: string; description?: string }) => void;
}

export default function CreateTeamModal({ isOpen, onClose, onCreate }: CreateTeamModalProps) {
  const [formState, setFormState] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formState);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Team</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Team Name
            </label>
            <input
              type="text"
              id="name"
              value={formState.name}
              onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formState.description}
              onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 3.3 Team Details Modal

```typescript
// frontend/app/dashboard/teams/TeamDetailsModal.tsx (new file)

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Team {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  sharedAgents: string[];
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  _id: string;
  userId: string;
  email: string;
  role: string;
  isActive: boolean;
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
}

interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
}

export default function TeamDetailsModal({ isOpen, onClose, team }: TeamDetailsModalProps) {
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const fetchTeamMembers = async () => {
    const response = await fetch(`/api/teams/${team?._id}/members`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch team members");
    }

    return response.json();
  };

  const fetchSharedAgents = async () => {
    const response = await fetch(`/api/teams/${team?._id}/shared-agents`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch shared agents");
    }

    return response.json();
  };

  const { data: members = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ["teamMembers", team?._id],
    queryFn: fetchTeamMembers,
    enabled: !!team && isOpen,
  });

  const { data: sharedAgents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["sharedAgents", team?._id],
    queryFn: fetchSharedAgents,
    enabled: !!team && isOpen,
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/teams/${team?._id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to invite member");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", team?._id] });
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setInviteRole("viewer");
      toast.success("Member invited successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleInviteMember = () => {
    inviteMemberMutation.mutate();
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{team.name} Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {team.description && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">{team.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Members ({members.length})</h3>
            {membersLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                    </div>
                    {member.isActive ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="mt-4 w-full px-3 py-2 border border-indigo-600 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-50"
            >
              Invite Member
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shared Agents ({sharedAgents.length})</h3>
            {agentsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedAgents.map((agent: any) => (
                  <div key={agent._id} className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                    {agent.description && (
                      <p className="text-xs text-gray-500">{agent.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(team.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(team.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Invite Member</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInviteMember();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3.4 Update Dashboard Navigation

```typescript
// frontend/app/dashboard/layout.tsx (update to include teams nav)

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/create-agent", label: "Create Agent", icon: "🤖" },
  { href: "/dashboard/leads", label: "Leads", icon: "📈" },
  { href: "/dashboard/teams", label: "Teams", icon: "👥" }, // Add teams nav
  { href: "/dashboard/billing", label: "Billing", icon: "💳" },
  { href: "/dashboard/billing-history", label: "Billing History", icon: "📄" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ... existing code
}
```

### 3.5 Team Invitation Accept/Reject Page

```typescript
// frontend/app/teams/invite/[token]/page.tsx (new file)

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../app/hooks/useAuth";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<any>(null);

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const response = await fetch(`/api/teams/invite/${params.token}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setInvitationDetails(data);
        }
      } catch (error) {
        console.error('Error fetching invitation details:', error);
      }
    };

    fetchInvitationDetails();
  }, [params.token]);

  const handleAccept = async () => {
    if (!user) {
      toast.error('Please login to accept the invitation');
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/invite/${params.token}/accept`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      toast.success('Invitation accepted!');
      router.push('/dashboard/teams');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/invite/${params.token}/reject`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject invitation');
      }

      toast.success('Invitation rejected');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!invitationDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {user ? 'You have been invited!' : 'Team Invitation'}
          </h1>
          <p className="text-gray-600 mb-2">
            You're invited to join the <strong>{invitationDetails.teamName}</strong> team
          </p>
          <p className="text-gray-500 text-sm">
            Role: {invitationDetails.role}
          </p>
        </div>

        <div className="space-y-4">
          {user ? (
            <>
              <button
                onClick={handleAccept}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Accepting...' : 'Accept Invitation'}
              </button>
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoading ? 'Rejecting...' : 'Reject Invitation'}
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Login to Accept Invitation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Phase 4: Agents Service Enhancement (0.5 weeks)

### 4.1 Add Team Access Control

```typescript
// backend/src/agents/agents.service.ts

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Agent, AgentDocument } from "./agents.schema";
import { User, UserDocument } from "../users/users.schema";
import { TeamsService } from "../teams/teams.service";
import { TeamRole } from "../teams/team-members.schema";

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<AgentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private teamsService: TeamsService,
  ) {}

  // Update existing methods to check team access
  async findOne(id: string, userId: string): Promise<AgentDocument> {
    const agent = await this.agentModel.findById(id);
    if (!agent) {
      throw new NotFoundException("Agent not found");
    }

    // Check if user owns the agent or has access via team
    if (agent.userId.toString() === userId) {
      return agent;
    }

    // Check if agent is shared with user's team
    const user = await this.userModel.findById(userId).populate("teams");
    for (const team of user.teams as any[]) {
      const hasAccess = await this.teamsService.checkAccess(
        userId,
        team._id.toString(),
        [TeamRole.OWNER, TeamRole.ADMIN, TeamRole.EDITOR],
      );

      if (hasAccess && team.sharedAgents.includes(id)) {
        return agent;
      }
    }

    throw new ForbiddenException("You do not have access to this agent");
  }

  // Update other methods similarly to check team access
  // ...
}
```

## Phase 5: Integration & Testing (1 week)

### 5.1 Backend Integration

- Update AgentsService to check team access for agent operations
- Modify AgentsController to handle team-shared agents
- Add team ID to agent search and filter
- Implement role-based access control in all agent endpoints

### 5.2 Frontend Integration

- Add teams navigation to dashboard sidebar
- Update dashboard layout with teams section
- Modify agent creation and management pages to show shared agents
- Add team sharing options to agent settings

### 5.3 Testing

- Unit tests for TeamsService
- Integration tests for TeamsController
- E2E tests for team management flow
- E2E tests for agent sharing
- Performance testing
- Role-based access control testing

### 5.4 Documentation

- Update API documentation
- Add user guide for team collaboration features
- Update architecture documentation
- Add role-based access control documentation

## Phase 6: Admin Dashboard Integration (Optional)

```typescript
// frontend/app/admin/teams/page.tsx (new file)

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../utils/admin-api";

interface Team {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerEmail: string;
  members: number;
  sharedAgents: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTeamsPage() {
  const queryClient = useQueryClient();

  const fetchTeams = async () => {
    const response = await adminApi.getTeams();
    return response.data;
  };

  const { data: teams = [], isLoading, error } = useQuery<Team[]>({
    queryKey: ["adminTeams"],
    queryFn: fetchTeams,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-8">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Teams</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Members
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shared Agents
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teams.map((team) => (
              <tr key={team._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                      {team.description && (
                        <div className="text-sm text-gray-500">{team.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.ownerEmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.members}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {team.sharedAgents}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(team.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(team.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Data Migration

- Existing users need default empty teams array
- No existing teams to migrate
- Default permissions for existing agents

## Performance Considerations

- Add indexes for common team queries
- Implement pagination for teams and members
- Use Redis caching for frequent team member queries
- Optimize database queries for shared agents

## Security Considerations

- Team data must be encrypted at rest
- Secure API endpoints with JWT authentication
- Validate and sanitize all inputs
- Implement rate limiting for team operations
- Role-based access control must be enforced at multiple layers

## Monitoring & Analytics

- Track team creation rate
- Monitor team member activity
- Track agent sharing activity
- Monitor invitation status changes
- Add team metrics to dashboard

## Future Enhancements

- Team chat and collaboration features
- Team workspaces for shared resources
- Audit logs for team activities
- Team-level analytics and reporting
- Integration with project management tools
- Custom role definitions
- Team billing and invoicing

## Final Deliverable

A complete team collaboration system that:

1. Allows users to create and manage teams
2. Invite team members with different roles (owner, admin, editor, viewer)
3. Role-based access control for all team operations
4. Agent sharing between team members
5. Team invitation system with email notifications
6. Team management dashboard
7. Integration with existing agent management
8. Admin dashboard for viewing all teams

The feature follows existing architectural patterns and can be implemented without breaking changes to the current system.
