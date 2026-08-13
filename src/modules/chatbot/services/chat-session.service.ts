import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateChatSessionDto, ChatSessionDto } from '../dto/chat-session.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ChatSessionService {
  constructor(private prisma: PrismaService) {}

  async createSession(dto: CreateChatSessionDto): Promise<ChatSessionDto> {
    const session = await this.prisma.chatSession.create({
      data: {
        id: uuid(),
        customerId: dto.customerId,
        municipalityId: dto.municipalityId,
        socketId: dto.socketId,
        status: 'ACTIVE',
        context: {},
      },
    });

    return this.mapToDto(session);
  }

  async getSession(sessionId: string): Promise<ChatSessionDto | null> {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    return session ? this.mapToDto(session) : null;
  }

  async getActiveSession(customerId: string): Promise<ChatSessionDto | null> {
    const session = await this.prisma.chatSession.findFirst({
      where: {
        customerId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    return session ? this.mapToDto(session) : null;
  }

  async updateSession(sessionId: string, data: Partial<ChatSessionDto>): Promise<ChatSessionDto> {
    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        socketId: data.socketId,
        context: data.context,
        status: data.status,
        lastMessageAt: new Date(),
      },
    });

    return this.mapToDto(updated);
  }

  async closeSession(sessionId: string): Promise<ChatSessionDto> {
    const updated = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    return this.mapToDto(updated);
  }

  async updateMessageCount(sessionId: string): Promise<void> {
    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        messageCount: { increment: 1 },
        lastMessageAt: new Date(),
      },
    });
  }

  private mapToDto(session: any): ChatSessionDto {
    return {
      id: session.id,
      customerId: session.customerId,
      municipalityId: session.municipalityId,
      socketId: session.socketId,
      status: session.status,
      messageCount: session.messageCount,
      context: session.context,
      lastMessageAt: session.lastMessageAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      closedAt: session.closedAt,
    };
  }
}
