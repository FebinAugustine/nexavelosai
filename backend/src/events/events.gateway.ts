import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TeamMember, TeamMemberDocument } from '../teams/team-members.schema';
import { Team, TeamDocument } from '../teams/teams.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(TeamMember.name)
    private teamMemberModel: Model<TeamMemberDocument>,
    @InjectModel(Team.name)
    private teamModel: Model<TeamDocument>,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`New client connection: ${client.id}`);
    const token = client.handshake.auth.token;
    if (!token) {
      this.logger.warn(`Client ${client.id} connected without a token.`);
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'test-secret',
      });
      const userId = payload.sub;
      client.join(userId);
      this.logger.log(
        `Client ${client.id} (user: ${userId}) connected and joined room.`,
      );
    } catch (error) {
      this.logger.error(
        `Authentication error for client ${client.id}: ${error.message}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('analytics')
  handleAnalytics(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // Handle analytics events if needed
    console.log('Analytics event:', data);
  }

  // Method to emit analytics updates
  emitAnalyticsUpdate(data: any) {
    this.server.emit('analyticsUpdate', data);
  }

  // Method to send a message to a specific user
  sendToUser(userId: string, event: string, data: any) {
    this.logger.log(`Sending event '${event}' to user room '${userId}'`);
    this.server.to(userId).emit(event, data);
  }

  // Method to send a message to all members of a team
  async sendToTeamMembers(teamId: string, event: string, data: any) {
    this.logger.log(`Sending event '${event}' to team room '${teamId}'`);

    // Get all active team members
    const teamMembers = await this.teamMemberModel
      .find({
        teamId: new Types.ObjectId(teamId),
        isActive: true,
      })
      .select('userId');

    // Send notification to each team member
    for (const member of teamMembers) {
      this.server.to(member.userId.toString()).emit(event, data);
    }
  }

  // Method to send webhook event notifications
  sendWebhookEventNotification(userId: string, webhookEvent: any) {
    this.sendToUser(userId, 'webhookEvent', webhookEvent);
  }

  // Method to send webhook event notifications to all team members with access to the agent
  async sendWebhookEventNotificationToTeam(userId: string, webhookEvent: any) {
    // Check if webhook event is related to a specific agent
    const { agentId } = webhookEvent.payload || {};

    // Get all teams the user is part of
    const userTeams = await this.teamMemberModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .select('teamId');

    // For each team, check if the agent is shared with that team before sending notification
    for (const team of userTeams) {
      const teamDoc = await this.teamModel.findById(team.teamId);

      // If event is not related to any specific agent, or agent is shared with the team
      if (
        !agentId ||
        (teamDoc && teamDoc.sharedAgents.includes(new Types.ObjectId(agentId)))
      ) {
        await this.sendToTeamMembers(
          team.teamId.toString(),
          'webhookEvent',
          webhookEvent,
        );
      }
    }
  }
}
