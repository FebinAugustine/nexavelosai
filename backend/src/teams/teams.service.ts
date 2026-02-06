import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Team, TeamDocument } from './teams.schema';
import {
  TeamMember,
  TeamMemberDocument,
  TeamRole,
} from './team-members.schema';
import {
  Invitation,
  InvitationDocument,
  InvitationStatus,
} from './invitations.schema';
import { User, UserDocument } from '../users/users.schema';
import { MailService } from '../mail/mail.service';

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
    const existingTeam = await this.teamModel.findOne({
      ownerId: new Types.ObjectId(ownerId),
      name,
    });
    if (existingTeam) {
      throw new BadRequestException('Team with this name already exists');
    }

    const team = new this.teamModel({
      ownerId: new Types.ObjectId(ownerId),
      name,
      description,
      members: [new Types.ObjectId(ownerId)],
    });

    const savedTeam = await team.save();

    // Add owner as team member with owner role
    await this.teamMemberModel.create({
      userId: new Types.ObjectId(ownerId),
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
    const teams = await this.teamModel.find({
      members: new Types.ObjectId(userId),
    });
    return teams;
  }

  async getTeamById(teamId: string): Promise<TeamDocument> {
    const team = await this.teamModel.findById(teamId).populate('members');
    if (!team) {
      throw new NotFoundException('Team not found');
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
      throw new NotFoundException('Team not found');
    }

    // Check if user has permission to update team (owner or admin)
    const teamMember = await this.teamMemberModel.findOne({
      userId,
      teamId,
      role: { $in: [TeamRole.OWNER, TeamRole.ADMIN] },
    });

    if (!teamMember) {
      throw new ForbiddenException(
        'You do not have permission to update this team',
      );
    }

    const updatedTeam = await this.teamModel.findByIdAndUpdate(
      teamId,
      updateData,
      { new: true },
    );

    if (!updatedTeam) {
      throw new NotFoundException('Team not found');
    }

    return updatedTeam;
  }

  async deleteTeam(teamId: string, userId: string): Promise<void> {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user is team owner
    if (team.ownerId.toString() !== userId) {
      throw new ForbiddenException('Only team owner can delete the team');
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
      throw new NotFoundException('Team not found');
    }

    // Check if inviter has permission to invite
    const inviter = await this.teamMemberModel.findOne({
      userId: inviterId,
      teamId,
      role: { $in: [TeamRole.OWNER, TeamRole.ADMIN] },
    });

    if (!inviter) {
      throw new ForbiddenException(
        'You do not have permission to invite members',
      );
    }

    // Check if email is already in team
    const existingUser = await this.userModel.findOne({ email }).select('_id');
    if (existingUser) {
      const existingMember = await this.teamMemberModel.findOne({
        teamId,
        userId: existingUser._id,
      });

      if (existingMember) {
        throw new BadRequestException('User is already a member of this team');
      }
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await this.invitationModel.findOne({
      teamId,
      email,
      status: InvitationStatus.PENDING,
    });

    if (existingInvitation) {
      throw new BadRequestException(
        'An invitation already exists for this email',
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
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
      throw new BadRequestException('Invalid or expired invitation');
    }

    // Check if user is already a member
    const existingMember = await this.teamMemberModel.findOne({
      userId,
      teamId: invitation.teamId,
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this team');
    }

    // Add user as team member
    await this.teamMemberModel.create({
      userId,
      teamId: invitation.teamId,
      role: invitation.role,
      isActive: true,
      invitedBy: invitation.invitedBy,
      invitedAt: invitation.createdAt,
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

    // Add user to team's members array
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
      throw new BadRequestException('Invalid or expired invitation');
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
        'You do not have permission to remove members',
      );
    }

    // Check if trying to remove owner
    const memberToRemove = await this.teamMemberModel.findOne({
      userId: memberId,
      teamId,
    });

    if (!memberToRemove) {
      throw new NotFoundException('Member not found');
    }

    if (memberToRemove.role === TeamRole.OWNER) {
      throw new BadRequestException('Cannot remove team owner');
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
        'You do not have permission to update roles',
      );
    }

    // Check if trying to change owner's role
    const member = await this.teamMemberModel.findOne({
      userId: memberId,
      teamId,
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === TeamRole.OWNER) {
      throw new BadRequestException('Cannot change team owner role');
    }

    const updatedMember = await this.teamMemberModel.findOneAndUpdate(
      { userId: memberId, teamId },
      { role: newRole },
      { new: true },
    );

    if (!updatedMember) {
      throw new NotFoundException('Member not found');
    }

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
      throw new NotFoundException('Team not found');
    }

    // Check if user has permission to share agents
    const teamMember = await this.teamMemberModel.findOne({
      userId,
      teamId,
      role: { $in: [TeamRole.OWNER, TeamRole.ADMIN] },
    });

    if (!teamMember) {
      throw new ForbiddenException(
        'You do not have permission to share agents',
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
      throw new NotFoundException('Team not found');
    }

    // Check if user has permission to unshare agents
    const teamMember = await this.teamMemberModel.findOne({
      userId,
      teamId,
      role: { $in: [TeamRole.OWNER, TeamRole.ADMIN] },
    });

    if (!teamMember) {
      throw new ForbiddenException(
        'You do not have permission to unshare agents',
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
      userId: new Types.ObjectId(userId),
      teamId: new Types.ObjectId(teamId),
    });

    if (!teamMember) {
      // If user is not a member of the team, return empty array instead of throwing an error
      return [];
    }

    const team = await this.teamModel.findById(teamId).populate('sharedAgents');
    if (!team) {
      throw new NotFoundException('Team not found');
    }

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
