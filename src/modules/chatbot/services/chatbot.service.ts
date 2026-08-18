import { Injectable, Logger } from '@nestjs/common';
import { ChatSessionService } from './chat-session.service';
import { ChatMessageService } from './chat-message.service';
import { ClaudeIntegrationService } from './claude-integration.service';
import { IntentAnalyzerService } from './intent-analyzer.service';
import { PresetResponsesService } from './preset-responses.service';
import { ChatSessionDto, ChatResponseDto } from '../dto/chat-session.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private sessionService: ChatSessionService,
    private messageService: ChatMessageService,
    private claudeService: ClaudeIntegrationService,
    private intentAnalyzer: IntentAnalyzerService,
    private presetResponses: PresetResponsesService,
  ) {}

  async processMessage(
    customerId: string,
    content: string,
    municipalityId?: string,
  ): Promise<ChatResponseDto> {
    try {
      // Validar entrada
      if (!customerId || !customerId.trim()) {
        throw new Error('customerId is required');
      }
      if (!content || !content.trim()) {
        throw new Error('Message content cannot be empty');
      }
      if (content.length > 2000) {
        throw new Error('Message content exceeds maximum length of 2000 characters');
      }

      const sanitizedContent = content.trim();

      // Obtener o crear sesión activa
      let session = await this.sessionService.getActiveSession(customerId);

      if (!session) {
        session = await this.sessionService.createSession({
          customerId,
          municipalityId: municipalityId || 'default',
        });
      }

      // Guardar mensaje del usuario
      await this.messageService.createMessage(session.id, 'USER', sanitizedContent, {
        source: 'WEBSOCKET',
      });

      // Analizar intención y prioridad
      const intentAnalysis = this.intentAnalyzer.analyzeIntent(content);

      this.logger.debug(
        `Intent: ${intentAnalysis.intent}, Priority: ${intentAnalysis.priority}, Confidence: ${intentAnalysis.confidence}%`
      );

      // Intentar respuesta pre-configurada si aplica (solo si ALTA confianza)
      let responseText: string;
      let tokensUsed = 0;
      let processingTime = 0;

      const presetResponse = this.presetResponses.detectPresetResponse(sanitizedContent);

      if (presetResponse && intentAnalysis.confidence > 0.85) {
        const startTime = Date.now();
        responseText = presetResponse.response;
        processingTime = Date.now() - startTime;
        this.logger.debug(`Using preset response for intent: ${intentAnalysis.intent} (${processingTime}ms)`);
      } else {
        // Obtener historial reciente para contexto
        const recentMessages = await this.messageService.getRecentMessages(session.id, 10);

        // Preparar mensajes para Claude con metadata de intención
        const claudeMessages = recentMessages.map(msg => ({
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          content: msg.content,
        }));

        // Enriquecer system prompt con contexto de intención
        const enrichedSystemPrompt = this.getEnrichedSystemPrompt(intentAnalysis);

        // Procesar con Claude
        const startTime = Date.now();
        const claudeResult = await this.claudeService.processMessage(claudeMessages, enrichedSystemPrompt);
        processingTime = Date.now() - startTime;

        responseText = claudeResult.response;
        tokensUsed = claudeResult.tokens;

        this.logger.debug(`Message processed with Claude in ${processingTime}ms (Priority: ${intentAnalysis.priority})`);
      }

      // Guardar respuesta del asistente
      const assistantMessage = await this.messageService.createMessage(
        session.id,
        'ASSISTANT',
        responseText,
        {
          source: 'WEBSOCKET',
          tokens: tokensUsed,
          metadata: {
            intent: intentAnalysis.intent,
            priority: intentAnalysis.priority,
            confidence: intentAnalysis.confidence,
          },
        },
      );

      // Actualizar sesión
      await this.sessionService.updateMessageCount(session.id);

      return {
        sessionId: session.id,
        messageId: assistantMessage.id,
        response: assistantMessage.content,
        role: 'ASSISTANT',
        tokens: tokensUsed,
        processingTimeMs: processingTime,
        timestamp: assistantMessage.createdAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing message: ${message}`);
      return {
        sessionId: '',
        messageId: '',
        response: 'Disculpa, estoy teniendo dificultades técnicas. Por favor intenta de nuevo o contacta a nuestro equipo de soporte.',
        role: 'ASSISTANT',
        tokens: 0,
        processingTimeMs: 0,
        timestamp: new Date(),
        error: message,
      } as any;
    }
  }

  private getEnrichedSystemPrompt(intentAnalysis: any): string {
    const intentGuidance: Record<string, string> = {
      TRACK_ORDER: 'Usuario quiere rastrear pedido → Solicita #pedido y proporciona estado',
      COMPLAINT: 'Usuario con problema/queja → Empatiza, valida, ofrece solución',
      DELIVERY_ISSUE: 'Problema de entrega → Investiga, ofrece reintento o compensación',
      PAYMENT: 'Consulta de pago → Explica opciones, resuelve problemas',
      RETURN: 'Devolver/cambiar producto → Explica proceso 30 días',
      PRODUCT_INFO: 'Información de producto → Proporciona detalles disponibles',
      GENERAL: 'Consulta general → Ofrece ayuda proactiva',
    };

    const urgency: Record<string, string> = {
      HIGH: '⚠️ URGENTE - Resuelve rápido, ofrece soluciones concretas',
      MEDIUM: 'Normal - Responde profesionalmente',
      LOW: 'Informativo - Detallado pero sin prisa',
    };

    return `${this.claudeService.getDefaultSystemPrompt()}

CONTEXTO ESPECÍFICO:
${urgency[intentAnalysis.priority as string] || urgency.MEDIUM}
Intención: ${intentAnalysis.intent} (confianza: ${Math.round(intentAnalysis.confidence)}%)
Acción: ${intentGuidance[intentAnalysis.intent] || intentGuidance.GENERAL}`;
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
