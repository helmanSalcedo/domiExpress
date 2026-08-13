import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

export const BullConfig = BullModule.forRootAsync({
  useFactory: (_configService: ConfigService) => ({
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }),
  inject: [ConfigService],
});

export const QueueNames = {
  // Notifications (3)
  WHATSAPP_NOTIFICATIONS: 'whatsapp-notifications',
  EMAIL_NOTIFICATIONS: 'email-notifications',
  PUSH_NOTIFICATIONS: 'push-notifications',

  // Payments (2)
  PAYMENT_PROCESSING: 'payment-processing',
  PAYMENT_WEBHOOK: 'payment-webhook',

  // Orders (2)
  ORDER_CREATION: 'order-creation',
  ORDER_STATUS_UPDATE: 'order-status-update',

  // Deliveries (2)
  DELIVERY_ASSIGNMENT: 'delivery-assignment',
  DELIVERY_TRACKING: 'delivery-tracking',

  // Analytics (2)
  ANALYTICS_AGGREGATION: 'analytics-aggregation',
  REPORT_GENERATION: 'report-generation',

  // Maintenance (1)
  CLEANUP_JOBS: 'cleanup-jobs',
} as const;

export type QueueName = typeof QueueNames[keyof typeof QueueNames];
