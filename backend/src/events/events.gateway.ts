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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket, ...args: any[]) {
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
      this.logger.log(`Client ${client.id} (user: ${userId}) connected and joined room.`);
    } catch (error) {
      this.logger.error(`Authentication error for client ${client.id}: ${error.message}`);
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
}
