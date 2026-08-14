import { Injectable, Logger } from '@nestjs/common';
import { ChatSessionService } from './chat-session.service';
import { ChatMessageService } from './chat-message.service';
import { ClaudeIntegrationService } from './claude-integration.service';
import { ChatSessionDto, ChatResponseDto } from '../dto/chat-session.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private sessionService: ChatSessionService,
    private messageService: ChatMessageService,
    private claudeService: ClaudeIntegrationService,
  ) {}

  async processMessage(
    customerId: string,
    content: string,
    municipalityId?: string,
  ): Promise<ChatResponseDto> {
    try {
      // Obtener o crear sesión activa
      let session = await this.sessionService.getActiveSession(customerId);

      if (!session) {
        session = await this.sessionService.createSession({
          customerId,
          municipalityId: municipalityId || 'default',
        });
      }

      // Guardar mensaje del usuario
      await this.messageService.createMessage(session.id, 'USER', content, {
        source: 'WEBSOCKET',
      });

      // Obtener historial reciente para contexto
      const recentMessages = await this.messageService.getRecentMessages(session.id, 10);

      // Preparar mensajes para Claude
      const claudeMessages = recentMessages.map(msg => ({
        role: msg.role.toLowerCase() as 'user' | 'assistant',
        content: msg.content,
      }));

      // Procesar con Claude
      const startTime = Date.now();
      const claudeResult = await this.claudeService.processMessage(claudeMessages);
      const processingTime = Date.now() - startTime;

      // Guardar respuesta del asistente
      const assistantMessage = await this.messageService.createMessage(
        session.id,
        'ASSISTANT',
        claudeResult.response,
        {
          source: 'WEBSOCKET',
          tokens: claudeResult.tokens,
          processingTimeMs: processingTime,
        },
      );

      // Actualizar sesión
      await this.sessionService.updateMessageCount(session.id);

      this.logger.debug(`Message processed for customer ${customerId} in ${processingTime}ms`);

      return {
        sessionId: session.id,
        messageId: assistantMessage.id,
        response: assistantMessage.content,
        role: 'ASSISTANT',
        tokens: claudeResult.tokens,
        processingTimeMs: processingTime,
        timestamp: assistantMessage.createdAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing message: ${message}`);
      throw error;
    }
  }

  async createSession(customerId: string, municipalityId: string): Promise<ChatSessionDto> {
    return this.sessionService.createSession({
      customerId,
      municipalityId,
    });
  }

  async getSession(sessionId: string): Promise<ChatSessionDto | null> {
    return this.sessionService.getSession(sessionId);
  }

  async closeSession(sessionId: string): Promise<ChatSessionDto> {
    return this.sessionService.closeSession(sessionId);
  }

  async getConversationHistory(sessionId: string, limit: number = 50) {
    return this.messageService.getSessionMessages(sessionId, limit);
  }
}
