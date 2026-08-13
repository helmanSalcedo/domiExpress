import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueNames } from './bull.config';
import { QueueService } from './services/queue.service';
import {
  WhatsAppNotificationHandler,
  PaymentProcessingHandler,
  DeliveryTrackingHandler,
  AnalyticsAggregationHandler,
} from './handlers';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueNames.WHATSAPP_NOTIFICATIONS },
      { name: QueueNames.EMAIL_NOTIFICATIONS },
      { name: QueueNames.PUSH_NOTIFICATIONS },
      { name: QueueNames.PAYMENT_PROCESSING },
      { name: QueueNames.PAYMENT_WEBHOOK },
      { name: QueueNames.ORDER_CREATION },
      { name: QueueNames.ORDER_STATUS_UPDATE },
      { name: QueueNames.DELIVERY_ASSIGNMENT },
      { name: QueueNames.DELIVERY_TRACKING },
      { name: QueueNames.ANALYTICS_AGGREGATION },
      { name: QueueNames.REPORT_GENERATION },
      { name: QueueNames.CLEANUP_JOBS },
    ),
  ],
  providers: [
    QueueService,
    WhatsAppNotificationHandler,
    PaymentProcessingHandler,
    DeliveryTrackingHandler,
    AnalyticsAggregationHandler,
  ],
  exports: [QueueService],
})
export class QueueModule {}
