import { Injectable } from '@nestjs/common';
import { WhatsAppConversationService } from './whatsapp-conversation.service';

export interface EmulatorMsg {
  id: string;
  channel: string;
  message: string;
  phone: string;
  type: string;
  timestamp: Date;
  role?: string;
}

@Injectable()
export class EmulatorService {
  private messages: EmulatorMsg[] = [];

  constructor(private whatsappConversationService: WhatsAppConversationService) {}

  async processMessage(dto: { channel: string; message: string; phone: string }): Promise<{
    userMessage: EmulatorMsg;
    botMessage: EmulatorMsg;
  }> {
    // 1. Guardar mensaje del usuario
    const userMsg: EmulatorMsg = {
      id: Math.random().toString(36).substr(2, 9),
      channel: dto.channel,
      message: dto.message,
      phone: dto.phone,
      type: 'sent',
      timestamp: new Date(),
      role: 'USER',
    };
    this.messages.push(userMsg);

    // 2. Procesar con ChatBot (WhatsAppConversationService)
    const botResponse = await this.whatsappConversationService.processMessage(
      dto.channel as 'business' | 'customer' | 'driver',
      dto.phone,
      dto.message,
    );

    // 3. Guardar respuesta del bot
    const botMsg: EmulatorMsg = {
      id: Math.random().toString(36).substr(2, 9),
      channel: dto.channel,
      message: botResponse,
      phone: '573000000000',
      type: 'received',
      timestamp: new Date(Date.now() + 100),
      role: 'ASSISTANT',
    };
    this.messages.push(botMsg);

    // 4. Retornar ambos mensajes para mostrar en tiempo real
    return {
      userMessage: userMsg,
      botMessage: botMsg,
    };
  }

  async getMessagesByChannel(channel: string): Promise<EmulatorMsg[]> {
    return this.messages
      .filter(m => m.channel === channel)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(0, 200);
  }

  async getStats() {
    return {
      business: this.messages.filter(m => m.channel === 'business').length,
      customer: this.messages.filter(m => m.channel === 'customer').length,
      driver: this.messages.filter(m => m.channel === 'driver').length,
      total: this.messages.length,
    };
  }

  async clearAll() {
    this.messages = [];
    return { success: true };
  }
}
