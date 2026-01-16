import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('analytics')
  handleAnalytics(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // Handle analytics events if needed
    console.log('Analytics event:', data);
  }

  // Method to emit analytics updates
  emitAnalyticsUpdate(data: any) {
    this.server.emit('analyticsUpdate', data);
  }
}
