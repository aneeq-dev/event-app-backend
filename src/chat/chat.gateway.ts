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
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinEvent')
  handleJoinEvent(
    @MessageBody() eventId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`event_${eventId}`);
    return { event: `Joined event_${eventId}` };
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { eventId: string; userId: string; message: string; },
  ) {
    this.server.to(`event_${data.eventId}`).emit('newMessage', data);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`room_${roomId}`);
    return { event: `Joined room_${roomId}` };
  }

  @SubscribeMessage('sendPrivateMessage')
  handlePrivateMessage(
    @MessageBody() data: { recipientId: string; senderId: string; content: string; },
  ) {
    const roomId = [data.senderId, data.recipientId].sort().join('_');
    const message = {
      id: Date.now().toString(),
      senderId: data.senderId,
      content: data.content,
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    this.server.to(`room_${roomId}`).emit('newPrivateMessage', message);
  }
}
