# BullMQ Queue Usage Guide

## Overview

DomiExpress uses BullMQ for event-driven job processing with 12 specialized queues handling async operations across all modules.

## Queue Names

```typescript
WHATSAPP_NOTIFICATIONS  // Customer notifications via WhatsApp
EMAIL_NOTIFICATIONS     // Email alerts
PUSH_NOTIFICATIONS      // Mobile push notifications
PAYMENT_PROCESSING      // Payment processing & verification
PAYMENT_WEBHOOK         // Webhooks from payment processors
ORDER_CREATION          // Order creation workflows
ORDER_STATUS_UPDATE     // Order state transitions
DELIVERY_ASSIGNMENT     // Driver assignment to deliveries
DELIVERY_TRACKING       // Real-time location tracking
ANALYTICS_AGGREGATION   // Metrics calculation
REPORT_GENERATION       // Report exports
CLEANUP_JOBS            // Maintenance tasks
```

## Usage Examples

### 1. Send WhatsApp Notification

```typescript
import { QueueService } from '@shared/queue';

export class OrdersService {
  constructor(
    private queueService: QueueService,
    private ordersRepository: OrdersRepository,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.create(dto);

    // Queue notification asynchronously
    await this.queueService.sendWhatsAppNotification({
      phoneNumber: order.customerPhone,
      customerId: order.customerId,
      orderId: order.id,
      messageType: 'ORDER_CONFIRMATION',
      templateParams: {
        orderId: order.id,
        total: order.totalAmount.toString(),
        eta: '30 mins',
      },
    });

    return this.formatOrder(order);
  }
}
```

### 2. Process Payment

```typescript
export class PaymentsService {
  constructor(private queueService: QueueService) {}

  async initiatePayment(orderId: string): Promise<void> {
    const payment = await this.paymentRepository.create({
      orderId,
      amount: order.totalAmount,
      status: 'PENDING',
    });

    // Queue payment processing
    await this.queueService.processPayment({
      paymentId: payment.id,
      orderId,
      amount: order.totalAmount,
      currency: 'COP',
      customerId: order.customerId,
      paymentMethod: 'CARD',
    });
  }
}
```

### 3. Track Delivery Location

```typescript
export class DeliveriesService {
  constructor(private queueService: QueueService) {}

  async updateDeliveryLocation(
    deliveryId: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    // Queue location tracking
    await this.queueService.trackDeliveryLocation({
      deliveryId,
      driverId: delivery.driverId,
      orderId: delivery.orderId,
      latitude,
      longitude,
      accuracy: 5,
    });
  }
}
```

### 4. Aggregate Analytics

```typescript
export class AnalyticsService {
  constructor(private queueService: QueueService) {}

  async scheduleAnalyticsAggregation(
    municipalityId: string,
  ): Promise<void> {
    // Queue analytics job to run after 1 hour
    await this.queueService.aggregateAnalytics(
      {
        municipalityId,
        period: 'HOURLY',
      },
      3600000, // 1 hour delay
    );
  }
}
```

### 5. Batch Operations

```typescript
export class NotificationsService {
  constructor(private queueService: QueueService) {}

  async sendBulkNotifications(
    customerIds: string[],
  ): Promise<void> {
    const payloads = customerIds.map((customerId) => ({
      phoneNumber: customer.phone,
      customerId,
      messageType: 'PROMOTIONAL',
      customText: 'Special offer this week!',
    }));

    // Queue all at once
    await this.queueService.sendWhatsAppBatch(payloads);
  }
}
```

## Module Integration

To use QueueService in your module, import QueueModule:

```typescript
import { Module } from '@nestjs/common';
import { QueueModule } from '@shared/queue';
import { OrdersService } from './services/orders.service';

@Module({
  imports: [QueueModule],
  providers: [OrdersService],
})
export class OrdersModule {}
```

Then inject QueueService:

```typescript
constructor(private queueService: QueueService) {}
```

## Queue Monitoring

### Get Queue Statistics

```typescript
const stats = await this.queueService.getQueueStats();

console.log(stats);
// Output:
// {
//   whatsapp: { pending: 145, active: 3, delayed: 0, failed: 0 },
//   payment: { pending: 5, active: 2, delayed: 0, failed: 1 },
//   ...
// }
```

### Monitor in Real-time

```typescript
// Start consuming from queue
@Processor(QueueNames.WHATSAPP_NOTIFICATIONS)
export class WhatsAppConsumer {
  @OnGlobalQueueError()
  handleError(err: Error) {
    console.error('Queue error:', err);
  }

  @OnGlobalQueueFailed()
  handleFailed(job: Job) {
    console.error(`Job ${job.id} failed`);
  }

  @OnGlobalQueueCompleted()
  handleCompleted(job: Job) {
    console.log(`Job ${job.id} completed`);
  }
}
```

## Job Options

### Retry Logic

```typescript
await this.queueService.sendWhatsAppNotification(payload, {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
});
```

### Delayed Jobs

```typescript
// Send notification after 30 minutes
await this.queueService.sendWhatsAppNotification(
  payload,
  1800000, // milliseconds
);
```

### Job Priority

```typescript
// Add to queue (default priority = 0, higher is more important)
await queue.add(payload, {
  priority: 10,
});
```

## Best Practices

1. **Use queues for non-critical operations** — Notifications, analytics, reports
2. **Implement proper error handling** — Handlers should log failures
3. **Set appropriate retry policies** — Balance between resilience and cost
4. **Monitor queue health** — Check pending/failed job counts regularly
5. **Use delays strategically** — Spread load to avoid spikes
6. **Batch similar operations** — Reduce database queries
7. **Clean up successfully processed jobs** — `removeOnComplete: true`

## Debugging

### Redis CLI

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# List all keys
KEYS *

# Monitor queue operations
MONITOR

# Check specific queue
HGETALL bull:queue-name:*
```

### Check Job Status

```typescript
const job = await queue.getJob(jobId);
console.log(job.data);      // Job data
console.log(job.progress()); // Progress %
console.log(job.state());    // current|completed|failed|delayed|active
```

## Troubleshooting

### Jobs not processing
- Check Redis is running: `docker-compose ps`
- Verify handler is registered in QueueModule
- Check handler logs for errors

### Memory issues
- Reduce `removeOnFail: false` retention time
- Implement TTL on old jobs
- Monitor queue size: `getQueueStats()`

### Duplicate messages
- Use idempotent handlers
- Store processed job IDs
- Implement deduplication logic

## Production Considerations

1. **Set up monitoring** — Prometheus metrics for queue depth
2. **Configure alerts** — Alert on job failures
3. **Scale workers** — Run multiple consumer instances
4. **Implement DLQ** — Dead Letter Queue for failed jobs
5. **Backup Redis** — AOF persistence enabled
6. **Rate limiting** — Prevent queue overflow
