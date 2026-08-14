import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatbotService } from '../services/chatbot.service';
import { CreateMessageDto } from '../dto/create-message.dto';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  private connectedClients = new Map<string, { customerId: string; sessionId?: string }>();

  constructor(private chatbotService: ChatbotService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', {
      message: 'Successfully connected to chatbot',
      socketId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('start_session')
  async handleStartSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { customerId: string; municipalityId: string },
  ) {
    try {
      if (!data.customerId || !data.municipalityId) {
        throw new WsException('customerId and municipalityId are required');
      }

      const session = await this.chatbotService.createSession(data.customerId, data.municipalityId);

      this.connectedClients.set(client.id, {
        customerId: data.customerId,
        sessionId: session.id,
      });

      // Unir a un room específico por sesión
      client.join(`chat-${session.id}`);

      this.logger.debug(`Session started: ${session.id} for customer: ${data.customerId}`);

      return {
        status: 'success',
        sessionId: session.id,
        message: 'Chat session started',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error starting session: ${message}`);
      throw new WsException(message);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    try {
      if (!data.customerId || !data.content) {
        throw new WsException('customerId and content are required');
      }

      const clientInfo = this.connectedClients.get(client.id);
      if (!clientInfo || clientInfo.customerId !== data.customerId) {
        throw new WsException('Invalid customer or session');
      }

      this.logger.debug(
        `Processing message from customer: ${data.customerId}, content: ${data.content.substring(0, 50)}...`,
      );

      // Procesar mensaje con chatbot
      const response = await this.chatbotService.processMessage(
        data.customerId,
        data.content,
        clientInfo.sessionId,
      );

      // Emitir respuesta al cliente
      client.emit('message_response', {
        status: 'success',
        data: {
          sessionId: response.sessionId,
          messageId: response.messageId,
          response: response.response,
          tokens: response.tokens,
          processingTimeMs: response.processingTimeMs,
          timestamp: response.timestamp,
        },
      });

      // Broadcast a otros clientes en la misma sesión (opcional)
      client.to(`chat-${response.sessionId}`).emit('message_received', {
        sessionId: response.sessionId,
        response: response.response,
        timestamp: response.timestamp,
      });

      return {
        status: 'success',
        message: 'Message processed',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing message: ${message}`);
      client.emit('error', {
        status: 'error',
        message,
      });
      throw new WsException(message);
    }
  }

  @SubscribeMessage('get_history')
  async handleGetHistory(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: { sessionId: string; limit?: number },
  ) {
    try {
      if (!data.sessionId) {
        throw new WsException('sessionId is required');
      }

      const history = await this.chatbotService.getConversationHistory(
        data.sessionId,
        data.limit || 50,
      );

      return {
        status: 'success',
        data: {
          sessionId: data.sessionId,
          messages: history,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error retrieving history: ${message}`);
      throw new WsException(message);
    }
  }

  @SubscribeMessage('end_session')
  async handleEndSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    try {
      if (!data.sessionId) {
        throw new WsException('sessionId is required');
      }

      const closedSession = await this.chatbotService.closeSession(data.sessionId);

      this.connectedClients.delete(client.id);
      client.leave(`chat-${data.sessionId}`);

      this.logger.debug(`Session closed: ${data.sessionId}`);

      return {
        status: 'success',
        message: 'Chat session ended',
        sessionId: closedSession.id,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error ending session: ${message}`);
      throw new WsException(message);
    }
  }

  @SubscribeMessage('ping')
  handlePing() {
    return {
      status: 'pong',
      timestamp: new Date(),
    };
  }
}
