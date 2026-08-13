import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisKeys } from '../redis.config';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  };

  constructor(private redisService: RedisService) {}

  /**
   * Check if request is allowed under rate limit
   */
  async isAllowed(
    identifier: string,
    config?: RateLimitConfig,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const rateLimitConfig = config || this.defaultConfig;
    const key = RedisKeys.RATE_LIMIT(identifier);

    const current = await this.redisService.incr(key);

    // Set TTL on first request
    if (current === 1) {
      const ttlSeconds = Math.ceil(rateLimitConfig.windowMs / 1000);
      await this.redisService.expire(key, ttlSeconds);
    }

    const remaining = Math.max(0, rateLimitConfig.maxRequests - current);
    const resetTTL = await this.redisService.ttl(key);
    const resetAt = new Date(Date.now() + resetTTL * 1000);

    const allowed = current <= rateLimitConfig.maxRequests;

    if (!allowed) {
      this.logger.warn(
        `Rate limit exceeded for ${identifier}: ${current}/${rateLimitConfig.maxRequests}`,
      );
    }

    return {
      allowed,
      remaining,
      resetAt,
    };
  }

  /**
   * Get current rate limit status
   */
  async getStatus(identifier: string): Promise<{
    current: number;
    max: number;
    resetAt: Date;
  }> {
    const key = RedisKeys.RATE_LIMIT(identifier);
    const current = parseInt((await this.redisService.get(key)) || '0', 10);
    const ttl = await this.redisService.ttl(key);
    const resetAt = ttl > 0 ? new Date(Date.now() + ttl * 1000) : new Date();

    return {
      current,
      max: this.defaultConfig.maxRequests,
      resetAt,
    };
  }

  /**
   * Reset rate limit for identifier
   */
  async reset(identifier: string): Promise<void> {
    const key = RedisKeys.RATE_LIMIT(identifier);
    await this.redisService.del(key);
    this.logger.debug(`Reset rate limit for ${identifier}`);
  }

  /**
   * Limit with custom max requests per window
   */
  async isAllowedCustom(
    identifier: string,
    maxRequests: number,
    windowMs: number = RedisKeys.RATE_LIMIT_TTL * 1000,
  ): Promise<boolean> {
    const config: RateLimitConfig = {
      windowMs,
      maxRequests,
    };

    const result = await this.isAllowed(identifier, config);
    return result.allowed;
  }

  /**
   * Bulk check for multiple identifiers
   */
  async checkMultiple(
    identifiers: string[],
    config?: RateLimitConfig,
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const identifier of identifiers) {
      const result = await this.isAllowed(identifier, config);
      results.set(identifier, result.allowed);
    }

    return results;
  }
}
