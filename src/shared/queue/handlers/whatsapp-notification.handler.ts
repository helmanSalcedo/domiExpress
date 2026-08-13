import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QueueNames } from '../bull.config';

export interface WhatsAppNotificationPayload {
  phoneNumber: string;
  customerId?: string;
  driverId?: string;
  orderId?: string;
  messageType:
    | 'ORDER_CONFIRMATION'
    | 'ORDER_READY'
    | 'DELIVERY_ASSIGNED'
    | 'DELIVERY_STARTED'
    | 'DELIVERY_COMPLETED'
    | 'PAYMENT_CONFIRMATION'
    | 'PAYMENT_FAILED'
    | 'CUSTOM';
  templateParams?: Record<string, string>;
  customText?: string;
}

@Processor(QueueNames.WHATSAPP_NOTIFICATIONS)
export class WhatsAppNotificationHandler {
  private readonly logger = new Logger(WhatsAppNotificationHandler.name);

  @Process()
  async handleWhatsAppNotification(job: Job<WhatsAppNotificationPayload>): Promise<void> {
    const { phoneNumber, messageType, templateParams, customText, orderId } = job.data;

    this.logger.debug(`Processing WhatsApp notification for ${phoneNumber}: ${messageType}`);

    try {
      // TODO: Integrate with Meta WhatsApp Business API
      // For now, we'll just log the notification
      const messageContent = this.buildMessage(messageType, templateParams, customText);

      this.logger.log(
        `[WHATSAPP] To: ${phoneNumber} | Type: ${messageType} | Order: ${orderId || 'N/A'}`,
      );
      this.logger.debug(`Message: ${messageContent}`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // TODO: Call Meta WhatsApp API
      // const response = await this.whatsappService.sendMessage(phoneNumber, messageContent);

      job.progress(100);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp notification to ${phoneNumber}`, error);
      throw error;
    }
  }

  private buildMessage(
    messageType: string,
    params?: Record<string, string>,
    customText?: string,
  ): string {
    if (customText) {
      return customText;
    }

    const templates: Record<string, string> = {
      ORDER_CONFIRMATION: `¡Tu pedido #${params?.orderId} ha sido confirmado! 🎉\nTotal: $${params?.total}\nTiempo estimado: ${params?.eta}`,
      ORDER_READY: `¡Tu pedido está listo! 📦\nPuede ser recogido en ${params?.location}`,
      DELIVERY_ASSIGNED: `Tu pedido ha sido asignado a ${params?.driverName} 🚗\nPlaca: ${params?.vehiclePlate}`,
      DELIVERY_STARTED: `¡${params?.driverName} está en camino! 📍\nLlegará en aproximadamente ${params?.eta}`,
      DELIVERY_COMPLETED: `¡Pedido entregado! ✅\nGracias por tu compra. Déjanos tu calificación.`,
      PAYMENT_CONFIRMATION: `Pago recibido ✅\nMonto: $${params?.amount}\nReferencia: ${params?.reference}`,
      PAYMENT_FAILED: `❌ Falló el pago\nPor favor, intenta nuevamente o contacta soporte.`,
      CUSTOM: customText || 'Mensaje personalizado',
    };

    return templates[messageType] || 'Notificación desde DomiExpress';
  }
}
