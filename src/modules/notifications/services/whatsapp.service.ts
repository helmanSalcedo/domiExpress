import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface NotificationEvent {
  type: 'DRIVER_ASSIGNED' | 'DELIVERY_STARTED' | 'DELIVERY_COMPLETED' | 'PAYMENT_APPROVED';
  recipientPhone: string;
  data: Record<string, any>;
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
      timeout: 30000,
    });
  }

  async sendNotification(
    event: NotificationEvent,
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (!this.apiToken || !this.phoneNumberId) {
        this.logger.warn('⚠️ WhatsApp credentials not configured, skipping notification');
        return { success: true };
      }

      const message = this.buildMessage(event);
      const formattedPhone = this.formatPhoneNumber(event.recipientPhone);

      this.logger.log(`📱 Sending WhatsApp notification to ${formattedPhone}: ${event.type}`);

      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: { body: message },
      });

      const messageId = response.data?.messages?.[0]?.id;

      this.logger.log(
        `✅ WhatsApp message sent successfully to ${formattedPhone}, ID: ${messageId}`,
      );

      return { success: true, messageId };
    } catch (error) {
      this.logger.error(
        `❌ Failed to send WhatsApp message: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  }

  async sendDriverAssignmentNotification(
    driverPhone: string,
    deliveryId: string,
    customerName: string,
    destinationAddress: string,
    estimatedTime: number,
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.sendNotification({
      type: 'DRIVER_ASSIGNED',
      recipientPhone: driverPhone,
      data: { deliveryId, customerName, destinationAddress, estimatedTime },
    });
  }

  async sendDeliveryStartedNotification(
    customerPhone: string,
    driverName: string,
    driverPhone: string,
    deliveryId: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.sendNotification({
      type: 'DELIVERY_STARTED',
      recipientPhone: customerPhone,
      data: { driverName, driverPhone, deliveryId },
    });
  }

  async sendDeliveryCompletedNotification(
    customerPhone: string,
    deliveryId: string,
    totalAmount: number,
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.sendNotification({
      type: 'DELIVERY_COMPLETED',
      recipientPhone: customerPhone,
      data: { deliveryId, totalAmount },
    });
  }

  async sendPaymentApprovedNotification(
    customerPhone: string,
    orderId: string,
    amount: number,
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.sendNotification({
      type: 'PAYMENT_APPROVED',
      recipientPhone: customerPhone,
      data: { orderId, amount },
    });
  }

  async sendOrderConfirmation(
    phoneNumber: string,
    orderReference: string,
    totalAmount: number,
  ): Promise<boolean> {
    const result = await this.sendNotification({
      type: 'PAYMENT_APPROVED',
      recipientPhone: phoneNumber,
      data: { orderId: orderReference, amount: totalAmount },
    });

    return result.success;
  }

  async sendOrderStatusUpdate(
    phoneNumber: string,
    orderReference: string,
    status: string,
  ): Promise<boolean> {
    const result = await this.sendNotification({
      type: 'DELIVERY_STARTED',
      recipientPhone: phoneNumber,
      data: { orderId: orderReference, status },
    });

    return result.success;
  }

  private buildMessage(event: NotificationEvent): string {
    switch (event.type) {
      case 'DRIVER_ASSIGNED':
        return this.buildDriverAssignedMessage(event.data);
      case 'DELIVERY_STARTED':
        return this.buildDeliveryStartedMessage(event.data);
      case 'DELIVERY_COMPLETED':
        return this.buildDeliveryCompletedMessage(event.data);
      case 'PAYMENT_APPROVED':
        return this.buildPaymentApprovedMessage(event.data);
      default:
        return 'Notificación de DomiExpress 🚚';
    }
  }

  private buildDriverAssignedMessage(data: Record<string, any>): string {
    return `¡Nuevo pedido! 📦\n\nCliente: ${data.customerName}\nDestino: ${data.destinationAddress}\nTiempo estimado: ${data.estimatedTime} min\n\nConfirma en la app.`;
  }

  private buildDeliveryStartedMessage(data: Record<string, any>): string {
    return `¡Tu pedido está en camino! 🚗\n\nConductor: ${data.driverName}\nTeléfono: ${data.driverPhone}\n\nSigue tu pedido en tiempo real.`;
  }

  private buildDeliveryCompletedMessage(data: Record<string, any>): string {
    return `¡Entregado! ✅\n\nPedido: ${data.deliveryId}\nMonto: $${data.totalAmount?.toLocaleString('es-CO') || 0}\n\nCalifica tu experiencia. 👍`;
  }

  private buildPaymentApprovedMessage(data: Record<string, any>): string {
    return `¡Pago confirmado! ✅\n\nPedido: ${data.orderId}\nMonto: $${data.amount?.toLocaleString('es-CO') || 0}\n\nTu pedido será entregado pronto. 🚚`;
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('57')) {
      return `57${cleaned}`;
    }
    return cleaned;
  }
}
