import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  imageUrl?: string;
  data?: Record<string, string>;
  badge?: string;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly messaging: admin.messaging.Messaging;

  constructor() {
    if (process.env.FIREBASE_PROJECT_ID) {
      try {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          clientId: process.env.FIREBASE_CLIENT_ID,
          authUri: 'https://accounts.google.com/o/oauth2/auth',
          tokenUri: 'https://oauth2.googleapis.com/token',
          authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
          clientX509CertUrl: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        this.messaging = admin.messaging();
        this.logger.log('✅ Firebase Admin SDK initialized successfully');
      } catch (error) {
        this.logger.error(
          `⚠️ Firebase initialization failed: ${error instanceof Error ? error.message : error}`,
        );
        this.messaging = null;
      }
    } else {
      this.logger.warn('⚠️ Firebase credentials not configured');
      this.messaging = null;
    }
  }

  async sendPushNotification(
    deviceToken: string,
    notification: PushNotification,
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (!this.messaging) {
        this.logger.warn('⚠️ Firebase not configured, skipping push notification');
        return { success: true };
      }

      this.logger.log(`📲 Sending push notification to ${deviceToken}: ${notification.title}`);

      const message: admin.messaging.Message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: notification.icon || 'https://domiexpress.co/logo.png',
            image: notification.imageUrl,
            badge: notification.badge || 'https://domiexpress.co/badge.png',
          },
        },
        android: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: notification.icon,
            image: notification.imageUrl,
          },
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              badge: 1,
              sound: 'default',
            },
          },
        },
      };

      const messageId = await this.messaging.send(message);

      this.logger.log(`✅ Push notification sent successfully, ID: ${messageId}`);
      return { success: true, messageId };
    } catch (error) {
      this.logger.error(
        `❌ Failed to send push notification: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  }

  async sendOrderConfirmationNotification(
    deviceToken: string,
    orderId: string,
    amount: number,
  ): Promise<boolean> {
    const result = await this.sendPushNotification(deviceToken, {
      title: '¡Pedido Confirmado! 🎉',
      body: `Tu pedido #${orderId} fue confirmado. Monto: $${amount.toLocaleString('es-CO')}`,
      icon: '🎉',
      data: {
        type: 'order_confirmed',
        orderId,
      },
    });

    return result.success;
  }

  async sendDeliveryAssignedNotification(
    deviceToken: string,
    driverId: string,
    driverName: string,
  ): Promise<boolean> {
    const result = await this.sendPushNotification(deviceToken, {
      title: '¡Tu entrega fue asignada! 🚗',
      body: `Conductor: ${driverName}. Verifica los detalles en la app.`,
      icon: '🚗',
      data: {
        type: 'driver_assigned',
        driverId,
      },
    });

    return result.success;
  }

  async sendDeliveryStartedNotification(deviceToken: string, driverName: string): Promise<boolean> {
    const result = await this.sendPushNotification(deviceToken, {
      title: '¡Tu pedido está en camino! 📍',
      body: `${driverName} está en camino con tu pedido. Sigue en tiempo real.`,
      icon: '📍',
      data: {
        type: 'delivery_started',
      },
    });

    return result.success;
  }

  async sendDeliveryCompletedNotification(deviceToken: string, orderId: string): Promise<boolean> {
    const result = await this.sendPushNotification(deviceToken, {
      title: '¡Pedido Entregado! ✅',
      body: `Tu pedido #${orderId} fue entregado. ¡Califica tu experiencia!`,
      icon: '✅',
      data: {
        type: 'delivery_completed',
        orderId,
      },
    });

    return result.success;
  }

  async sendPromotionalNotification(
    deviceTokens: string[],
    title: string,
    body: string,
  ): Promise<{ sent: number; failed: number }> {
    this.logger.log(`📲 Sending promotional notification to ${deviceTokens.length} users`);

    if (!this.messaging) {
      this.logger.warn('⚠️ Firebase not configured, skipping bulk notification');
      return { sent: deviceTokens.length, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const token of deviceTokens) {
      try {
        const result = await this.sendPushNotification(token, {
          title,
          body,
          data: {
            type: 'promotional',
          },
        });

        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    this.logger.log(`✅ Bulk notification sent: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  async subscribeToTopic(deviceToken: string, topic: string): Promise<boolean> {
    try {
      if (!this.messaging) {
        this.logger.warn('⚠️ Firebase not configured, skipping topic subscription');
        return true;
      }

      await this.messaging.subscribeToTopic([deviceToken], topic);
      this.logger.log(`✅ Device ${deviceToken} subscribed to topic: ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Failed to subscribe to topic: ${error instanceof Error ? error.message : error}`,
      );
      return false;
    }
  }

  async unsubscribeFromTopic(deviceToken: string, topic: string): Promise<boolean> {
    try {
      if (!this.messaging) {
        return true;
      }

      await this.messaging.unsubscribeFromTopic([deviceToken], topic);
      this.logger.log(`✅ Device ${deviceToken} unsubscribed from topic: ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Failed to unsubscribe from topic: ${error instanceof Error ? error.message : error}`,
      );
      return false;
    }
  }

  async sendToTopic(
    topic: string,
    notification: PushNotification,
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (!this.messaging) {
        this.logger.warn('⚠️ Firebase not configured, skipping topic notification');
        return { success: true };
      }

      this.logger.log(`📲 Sending notification to topic '${topic}': ${notification.title}`);

      const message: admin.messaging.Message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        topic,
      };

      const messageId = await this.messaging.send(message);

      this.logger.log(`✅ Topic notification sent, ID: ${messageId}`);
      return { success: true, messageId };
    } catch (error) {
      this.logger.error(
        `❌ Failed to send topic notification: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  }
}
