import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { ChatMessageDto } from '../dto/chat-session.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ChatMessageService {
  constructor(private prisma: PrismaService) {}

  async createMessage(
    chatSessionId: string,
    role: 'USER' | 'ASSISTANT' | 'SYSTEM',
    content: string,
    options?: {
      source?: string;
      messageType?: string;
      tokens?: number;
      processingTimeMs?: number;
      metadata?: any;
    },
  ): Promise<ChatMessageDto> {
    const message = await this.prisma.chatMessage.create({
      data: {
        id: uuid(),
        chatSessionId,
        role,
        content,
        source: options?.source || 'WEBSOCKET',
        messageType: options?.messageType || 'TEXT',
        tokens: options?.tokens,
        processingTimeMs: options?.processingTimeMs,
        metadata: options?.metadata,
      },
    });

    return this.mapToDto(message);
  }

  async getSessionMessages(chatSessionId: string, limit: number = 50): Promise<ChatMessageDto[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { chatSessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return messages.map((msg: any) => this.mapToDto(msg));
  }

  async getRecentMessages(chatSessionId: string, count: number = 10): Promise<ChatMessageDto[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { chatSessionId },
      orderBy: { createdAt: 'desc' },
      take: count,
    });

    return messages.reverse().map((msg: any) => this.mapToDto(msg));
  }

  private mapToDto(message: any): ChatMessageDto {
    return {
      id: message.id,
      chatSessionId: message.chatSessionId,
      role: message.role as 'USER' | 'ASSISTANT' | 'SYSTEM',
      content: message.content,
      source: message.source,
      messageType: message.messageType,
      metadata: message.metadata,
      tokens: message.tokens,
      processingTimeMs: message.processingTimeMs,
      createdAt: message.createdAt,
    };
  }
}
