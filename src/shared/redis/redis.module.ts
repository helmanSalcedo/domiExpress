import { Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';
import { CacheService } from './services/cache.service';
import { SessionService } from './services/session.service';
import { RateLimitService } from './services/rate-limit.service';

@Module({
  providers: [RedisService, CacheService, SessionService, RateLimitService],
  exports: [RedisService, CacheService, SessionService, RateLimitService],
})
export class RedisModule {}
