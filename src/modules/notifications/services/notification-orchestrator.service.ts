import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { PushService } from './push.service';
import { WhatsAppService } from './whatsapp.service';
import { NotificationPreferencesService } from './notification-preferences.service';

export interface UserNotificationChannels {
  email?: string;
  deviceToken?: string;
  phone?: string;
}

export enum NotificationEvent {
  ORDER_CONFIRMED = 'order_confirmed',
  PAYMENT_APPROVED = 'payment_approved',
  DRIVER_ASSIGNED = 'driver_assigned',
  DELIVERY_STARTED = 'delivery_started',
  DELIVERY_COMPLETED = 'delivery_completed',
  PROMOTIONAL = 'promotional',
}

@Injectable()
export class NotificationOrchestratorService {
  private readonly logger = new Logger(NotificationOrchestratorService.name);

  constructor(
    private emailService: EmailService,
    private pushService: PushService,
    private whatsappService: WhatsAppService,
    private preferencesService: NotificationPreferencesService,
  ) {}

  async notifyOrderConfirmed(
    userId: string,
    channels: UserNotificationChannels,
    orderId: string,
    amount: number,
  ): Promise<void> {
    this.logger.log(`🔔 Notifying user ${userId}: ORDER_CONFIRMED`);

    const prefs = await this.preferencesService.getPreferences(userId);

    // Send via enabled channels
    const promises = [];

    if (prefs.emailNotifications && channels.email) {
      promises.push(this.emailService.sendOrderConfirmation(channels.email, orderId, amount));
    }

    if (prefs.pushNotifications && channels.deviceToken) {
      promises.push(
        this.pushService.sendOrderConfirmationNotification(channels.deviceToken, orderId, amount),
      );
    }

    if (prefs.whatsappNotifications && channels.phone) {
      promises.push(
        this.whatsappService.sendPaymentApprovedNotification(channels.phone, orderId, amount),
      );
    }

    await Promise.allSettled(promises);
    this.logger.log(`✅ ORDER_CONFIRMED notifications sent to user ${userId}`);
  }

  async notifyPaymentApproved(
    userId: string,
    channels: UserNotificationChannels,
    orderId: string,
    amount: number,
  ): Promise<void> {
    this.logger.log(`🔔 Notifying user ${userId}: PAYMENT_APPROVED`);

    const prefs = await this.preferencesService.getPreferences(userId);
    const promises = [];

    if (prefs.emailNotifications && channels.email) {
      promises.push(this.emailService.sendOrderConfirmation(channels.email, orderId, amount));
    }

    if (prefs.pushNotifications && channels.deviceToken) {
      promises.push(
        this.pushService.sendOrderConfirmationNotification(channels.deviceToken, orderId, amount),
      );
    }

    if (prefs.whatsappNotifications && channels.phone) {
      promises.push(
        this.whatsappService.sendPaymentApprovedNotification(channels.phone, orderId, amount),
      );
    }

    await Promise.allSettled(promises);
    this.logger.log(`✅ PAYMENT_APPROVED notifications sent to user ${userId}`);
  }

  async notifyDriverAssigned(
    userId: string,
    channels: UserNotificationChannels,
    driverId: string,
    driverName: string,
    phone: string,
  ): Promise<void> {
    this.logger.log(`🔔 Notifying user ${userId}: DRIVER_ASSIGNED`);

    const prefs = await this.preferencesService.getPreferences(userId);
    const promises = [];

    if (prefs.pushNotifications && channels.deviceToken) {
      promises.push(
        this.pushService.sendDeliveryAssignedNotification(
          channels.deviceToken,
          driverId,
          driverName,
        ),
      );
    }

    if (prefs.whatsappNotifications && channels.phone) {
      promises.push(
        this.whatsappService.sendDeliveryStartedNotification(
          channels.phone,
          driverName,
          phone,
          driverId,
        ),
      );
    }

    await Promise.allSettled(promises);
    this.logger.log(`✅ DRIVER_ASSIGNED notifications sent to user ${userId}`);
  }

  async notifyDeliveryStarted(
    userId: string,
    channels: UserNotificationChannels,
    driverName: string,
  ): Promise<void> {
    this.logger.log(`🔔 Notifying user ${userId}: DELIVERY_STARTED`);

    const prefs = await this.preferencesService.getPreferences(userId);
    const promises = [];

    if (prefs.emailNotifications && channels.email) {
      promises.push(
        this.emailService.sendDeliveryNotification(
          channels.email,
          'order-123',
          driverName,
          'phone',
        ),
      );
    }

    if (prefs.pushNotifications && channels.deviceToken) {
      promises.push(
        this.pushService.sendDeliveryStartedNotification(channels.deviceToken, driverName),
      );
    }

    if (prefs.whatsappNotifications && channels.phone) {
      promises.push(
        this.whatsappService.sendDeliveryStartedNotification(
          channels.phone,
          driverName,
          'phone',
          'delivery-123',
        ),
      );
    }

    await Promise.allSettled(promises);
    this.logger.log(`✅ DELIVERY_STARTED notifications sent to user ${userId}`);
  }

  async notifyDeliveryCompleted(
    userId: string,
    channels: UserNotificationChannels,
    orderId: string,
    amount: number,
  ): Promise<void> {
    this.logger.log(`🔔 Notifying user ${userId}: DELIVERY_COMPLETED`);

    const prefs = await this.preferencesService.getPreferences(userId);
    const promises = [];

    if (prefs.emailNotifications && channels.email) {
      promises.push(this.emailService.sendDeliveryCompleted(channels.email, orderId, amount));
    }

    if (prefs.pushNotifications && channels.deviceToken) {
      promises.push(
        this.pushService.sendDeliveryCompletedNotification(channels.deviceToken, orderId),
      );
    }

    if (prefs.whatsappNotifications && channels.phone) {
      promises.push(
        this.whatsappService.sendDeliveryCompletedNotification(channels.phone, orderId, amount),
      );
    }

    await Promise.allSettled(promises);
    this.logger.log(`✅ DELIVERY_COMPLETED notifications sent to user ${userId}`);
  }
}
