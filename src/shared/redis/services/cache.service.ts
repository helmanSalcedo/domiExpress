import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisKeys } from '../redis.config';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private redisService: RedisService) {}

  /**
   * Get or execute - returns cached value or executes function and caches result
   */
  async getOrExecute<T>(key: string, executor: () => Promise<T>, ttl?: number): Promise<T> {
    // Try to get from cache
    const cached = await this.redisService.getJson<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache HIT for key: ${key}`);
      return cached;
    }

    // Execute function and cache result
    this.logger.debug(`Cache MISS for key: ${key}`);
    const result = await executor();
    await this.redisService.setJson(key, result, ttl);

    return result;
  }

  /**
   * Cache search results
   */
  async cacheSearchResults<T>(query: string, municipalityId: string, results: T[]): Promise<void> {
    const key = RedisKeys.SEARCH_RESULTS(query, municipalityId);
    await this.redisService.setJson(key, results, RedisKeys.SEARCH_TTL);
    this.logger.debug(`Cached search results for query: "${query}"`);
  }

  /**
   * Get cached search results
   */
  async getSearchResults<T>(query: string, municipalityId: string): Promise<T[] | null> {
    const key = RedisKeys.SEARCH_RESULTS(query, municipalityId);
    return this.redisService.getJson<T[]>(key);
  }

  /**
   * Invalidate search cache
   */
  async invalidateSearchCache(query: string, municipalityId: string): Promise<void> {
    const key = RedisKeys.SEARCH_RESULTS(query, municipalityId);
    await this.redisService.del(key);
    this.logger.debug(`Invalidated search cache for query: "${query}"`);
  }

  /**
   * Cache order data
   */
  async cacheOrder<T>(orderId: string, order: T): Promise<void> {
    const key = RedisKeys.ORDER(orderId);
    await this.redisService.setJson(key, order, RedisKeys.ORDER_TTL);
  }

  /**
   * Get cached order
   */
  async getCachedOrder<T>(orderId: string): Promise<T | null> {
    const key = RedisKeys.ORDER(orderId);
    return this.redisService.getJson<T>(key);
  }

  /**
   * Cache commerce status
   */
  async cacheCommerceStatus(commerceId: string, status: Record<string, any>): Promise<void> {
    const key = RedisKeys.COMMERCE_STATUS(commerceId);
    await this.redisService.setJson(key, status, RedisKeys.COMMERCE_STATUS_TTL);
  }

  /**
   * Get cached commerce status
   */
  async getCommerceStatus(commerceId: string): Promise<Record<string, any> | null> {
    const key = RedisKeys.COMMERCE_STATUS(commerceId);
    return this.redisService.getJson<Record<string, any>>(key);
  }

  /**
   * Invalidate all caches for a commerce
   */
  async invalidateCommerceCache(commerceId: string): Promise<void> {
    const key = RedisKeys.COMMERCE_STATUS(commerceId);
    await this.redisService.del(key);
    this.logger.debug(`Invalidated cache for commerce: ${commerceId}`);
  }

  /**
   * Cache analytics data
   */
  async cacheAnalytics(analyticsKey: string, data: Record<string, any>): Promise<void> {
    const key = RedisKeys.ANALYTICS(analyticsKey);
    await this.redisService.setJson(key, data, RedisKeys.ANALYTICS_TTL);
  }

  /**
   * Get cached analytics
   */
  async getAnalytics(analyticsKey: string): Promise<Record<string, any> | null> {
    const key = RedisKeys.ANALYTICS(analyticsKey);
    return this.redisService.getJson<Record<string, any>>(key);
  }

  /**
   * Invalidate analytics cache
   */
  async invalidateAnalyticsCache(analyticsKey: string): Promise<void> {
    const key = RedisKeys.ANALYTICS(analyticsKey);
    await this.redisService.del(key);
  }

  /**
   * Warm cache with data
   */
  async warmCache<T>(key: string, executor: () => Promise<T>, ttl?: number): Promise<void> {
    try {
      const data = await executor();
      await this.redisService.setJson(key, data, ttl);
      this.logger.log(`Warmed cache for key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to warm cache for key: ${key}`, error);
    }
  }

  /**
   * Clear all cache (caution: affects all keys)
   */
  async clearAllCache(): Promise<void> {
    await this.redisService.flushDb();
    this.logger.warn('⚠️ Cleared entire Redis cache');
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    dbSize: number;
    info: string;
  }> {
    const dbSize = await this.redisService.dbSize();
    const info = await this.redisService.info();

    return {
      dbSize,
      info,
    };
  }
}
