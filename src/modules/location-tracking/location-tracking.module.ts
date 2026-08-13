import { Module } from '@nestjs/common';
import { RedisModule } from '@shared/redis/redis.module';
import { LocationTrackingService } from './services/location-tracking.service';

@Module({
  imports: [RedisModule],
  providers: [LocationTrackingService],
  exports: [LocationTrackingService],
})
export class LocationTrackingModule {}
