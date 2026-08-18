import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './modules/health/health.module';
import { SharedModule } from './shared/shared.module';
import { RedisModule } from './shared/redis/redis.module';
import { QueueModule } from './shared/queue/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CommercesModule } from './modules/commerces/commerces.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { DriverEarningsModule } from './modules/driver-earnings/driver-earnings.module';
import { LocationTrackingModule } from './modules/location-tracking/location-tracking.module';
import { MunicipalitiesModule } from './modules/municipalities/municipalities.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { EmulatorModule } from './modules/emulator/emulator.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ] as any),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    SharedModule,
    HealthModule,
    RedisModule,
    QueueModule,
    // Phase 1: Auth + Commerces
    AuthModule,
    CustomersModule,
    CommercesModule,
    // Phase 2: Orders + Payments
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    // Phase 3: AI + Search + Chatbot
    SearchModule,
    ChatbotModule,
    EmulatorModule,
    // Phase 4: Drivers + Deliveries
    DriversModule,
    DeliveriesModule,
    DriverEarningsModule,
    LocationTrackingModule,
    // Phase 5: Admin + Operations
    MunicipalitiesModule,
    RatingsModule,
    DisputesModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
