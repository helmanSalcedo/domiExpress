import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface WhatsAppMessage {
  messaging_product: string;
  to: string;
  type: string;
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    parameters?: {
      body: {
        parameters: Array<{ type: string; text: string }>;
      };
    };
  };
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly client: AxiosInstance;
  private readonly apiToken: string;
  private readonly phoneNumberId: string;

  constructor() {
    this.apiToken = process.env.WHATSAPP_API_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    this.client = axios.create({
      baseURL: 'https://graph.instagram.com/v18.0',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const payload: WhatsAppMessage = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message,
        },
      };

      const response = await this.client.post(`/${this.phoneNumberId}/messages`, payload);

      this.logger.log(`Message sent to ${phoneNumber}: ${response.data.messages[0].id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send message to ${phoneNumber}: ${error}`);
      return false;
    }
  }

  async sendOrderConfirmation(
    phoneNumber: string,
    orderReference: string,
    totalAmount: number,
  ): Promise<boolean> {
    const message = `¡Orden confirmada! 🎉\n\nReferencia: ${orderReference}\nTotal: $${totalAmount.toLocaleString('es-CO')}\n\nTu pedido está siendo preparado. Pronto recibirás actualizaciones sobre tu entrega.`;

    return this.sendMessage(phoneNumber, message);
  }

  async sendOrderStatusUpdate(
    phoneNumber: string,
    orderReference: string,
    status: string,
  ): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      PREPARING: '👨‍🍳 Tu pedido está siendo preparado',
      READY_FOR_PICKUP: '📦 Tu pedido está listo para recoger',
      IN_TRANSIT: '🚚 Tu pedido está en camino',
      DELIVERED: '✅ Tu pedido ha sido entregado',
      CANCELLED: '❌ Tu pedido ha sido cancelado',
    };

    const message = `Actualización de tu orden ${orderReference}\n\n${statusMessages[status] || status}`;

    return this.sendMessage(phoneNumber, message);
  }

  async sendPaymentReminder(
    phoneNumber: string,
    orderReference: string,
    paymentLink: string,
  ): Promise<boolean> {
    const message = `Recuerda completar tu pago 💳\n\nOrden: ${orderReference}\n\nHaz clic aquí para pagar: ${paymentLink}`;

    return this.sendMessage(phoneNumber, message);
  }

  async sendCommerceNotification(
    phoneNumber: string,
    orderReference: string,
    totalAmount: number,
  ): Promise<boolean> {
    const message = `¡Nueva orden! 📋\n\nReferencia: ${orderReference}\nMonto: $${totalAmount.toLocaleString('es-CO')}\n\nAccede a tu aplicación para ver los detalles.`;

    return this.sendMessage(phoneNumber, message);
  }
}
