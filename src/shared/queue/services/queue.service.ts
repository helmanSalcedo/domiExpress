import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueNames } from '../bull.config';
import { WhatsAppNotificationPayload } from '../handlers/whatsapp-notification.handler';
import { PaymentProcessingPayload } from '../handlers/payment-processing.handler';
import { DeliveryTrackingPayload } from '../handlers/delivery-tracking.handler';
import { AnalyticsAggregationPayload } from '../handlers/analytics-aggregation.handler';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QueueNames.WHATSAPP_NOTIFICATIONS)
    private whatsappQueue: Queue<WhatsAppNotificationPayload>,
    @InjectQueue(QueueNames.PAYMENT_PROCESSING)
    private paymentQueue: Queue<PaymentProcessingPayload>,
    @InjectQueue(QueueNames.DELIVERY_TRACKING)
    private deliveryTrackingQueue: Queue<DeliveryTrackingPayload>,
    @InjectQueue(QueueNames.ANALYTICS_AGGREGATION)
    private analyticsQueue: Queue<AnalyticsAggregationPayload>,
  ) {}

  // WhatsApp Notifications
  async sendWhatsAppNotification(payload: WhatsAppNotificationPayload, delay?: number) {
    this.logger.debug(`Queuing WhatsApp notification to ${payload.phoneNumber}`);
    return this.whatsappQueue.add(payload, {
      delay,
      jobId: `whatsapp-${payload.phoneNumber}-${Date.now()}`,
    });
  }

  // Payment Processing
  async processPayment(payload: PaymentProcessingPayload, delay?: number) {
    this.logger.debug(`Queuing payment ${payload.paymentId}`);
    return this.paymentQueue.add(payload, {
      delay,
      jobId: `payment-${payload.paymentId}`,
    });
  }

  // Delivery Tracking
  async trackDeliveryLocation(payload: DeliveryTrackingPayload, delay?: number) {
    this.logger.debug(`Queuing delivery tracking for ${payload.deliveryId}`);
    return this.deliveryTrackingQueue.add(payload, {
      delay,
      jobId: `tracking-${payload.deliveryId}-${Date.now()}`,
    });
  }

  // Analytics Aggregation
  async aggregateAnalytics(payload: AnalyticsAggregationPayload, delay?: number) {
    this.logger.debug(`Queuing analytics aggregation for municipality ${payload.municipalityId}`);
    return this.analyticsQueue.add(payload, {
      delay,
      jobId: `analytics-${payload.municipalityId}-${payload.period}`,
    });
  }

  // Batch operations
  async sendWhatsAppBatch(payloads: WhatsAppNotificationPayload[]): Promise<void> {
    this.logger.debug(`Queuing ${payloads.length} WhatsApp notifications`);
    await this.whatsappQueue.addBulk(
      payloads.map((payload, index) => ({
        name: `whatsapp-${index}`,
        data: payload,
        opts: {
          jobId: `whatsapp-${payload.phoneNumber}-${Date.now()}-${index}`,
        },
      })),
    );
  }

  // Queue health
  async getQueueStats(): Promise<Record<string, any>> {
    const stats = {
      whatsapp: {
        pending: await this.whatsappQueue.count(),
        active: await this.whatsappQueue.getActiveCount(),
        delayed: await this.whatsappQueue.getDelayedCount(),
        failed: await this.whatsappQueue.getFailedCount(),
      },
      payment: {
        pending: await this.paymentQueue.count(),
        active: await this.paymentQueue.getActiveCount(),
        delayed: await this.paymentQueue.getDelayedCount(),
        failed: await this.paymentQueue.getFailedCount(),
      },
      deliveryTracking: {
        pending: await this.deliveryTrackingQueue.count(),
        active: await this.deliveryTrackingQueue.getActiveCount(),
        delayed: await this.deliveryTrackingQueue.getDelayedCount(),
        failed: await this.deliveryTrackingQueue.getFailedCount(),
      },
      analytics: {
        pending: await this.analyticsQueue.count(),
        active: await this.analyticsQueue.getActiveCount(),
        delayed: await this.analyticsQueue.getDelayedCount(),
        failed: await this.analyticsQueue.getFailedCount(),
      },
    };

    return stats;
  }
}
