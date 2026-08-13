import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { createRedisClient } from '../redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis!: Redis;
  private readonly logger = new Logger(RedisService.name);

  async onModuleInit() {
    this.redis = createRedisClient();
    await this.redis.ping();
    this.logger.log('✅ Redis service initialized');
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('✅ Redis service destroyed');
    }
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    const result = await this.redis.expire(key, ttl);
    return result === 1;
  }

  // JSON operations
  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    const json = JSON.stringify(value);
    await this.set(key, json, ttl);
  }

  // Geospatial operations (for driver locations)
  async geoAdd(key: string, longitude: number, latitude: number, member: string): Promise<number> {
    return this.redis.geoadd(key, longitude, latitude, member);
  }

  async geoRadius(
    key: string,
    longitude: number,
    latitude: number,
    radius: number,
    unit: 'm' | 'km' | 'ft' | 'mi' = 'km',
  ): Promise<string[]> {
    return (await this.redis.georadius(key, longitude, latitude, radius, unit)) as string[];
  }

  async geoDist(
    key: string,
    member1: string,
    member2: string,
    unit: 'm' | 'km' = 'km',
  ): Promise<string | null> {
    // Query geospatial distance - unit is implicit
    const distanceStr: any = await this.redis.call('geodist', key, member1, member2, unit);
    return distanceStr as string | null;
  }

  // Hash operations (for sessions, metadata)
  async hSet(key: string, field: string, value: string): Promise<number> {
    return this.redis.hset(key, field, value);
  }

  async hGet(key: string, field: string): Promise<string | null> {
    return this.redis.hget(key, field);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return this.redis.hgetall(key);
  }

  async hDel(key: string, field: string): Promise<number> {
    return this.redis.hdel(key, field);
  }

  // List operations
  async lPush(key: string, ...values: string[]): Promise<number> {
    return this.redis.lpush(key, ...values);
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.lrange(key, start, stop);
  }

  async lLen(key: string): Promise<number> {
    return this.redis.llen(key);
  }

  // Set operations
  async sAdd(key: string, ...members: string[]): Promise<number> {
    return this.redis.sadd(key, ...members);
  }

  async sMembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }

  async sIsMember(key: string, member: string): Promise<boolean> {
    const result = await this.redis.sismember(key, member);
    return result === 1;
  }

  // Pub/Sub
  subscribe(channel: string, callback: (message: string) => void): void {
    const subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });

    subscriber.subscribe(channel, err => {
      if (err) {
        this.logger.error(`Failed to subscribe to ${channel}:`, err);
      } else {
        this.logger.log(`✅ Subscribed to channel: ${channel}`);
      }
    });

    subscriber.on('message', (chan, message) => {
      if (chan === channel) {
        callback(message);
      }
    });
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.redis.publish(channel, message);
  }

  // Publish JSON
  async publishJson<T>(channel: string, data: T): Promise<number> {
    return this.publish(channel, JSON.stringify(data));
  }

  // Atomic operations
  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async incrBy(key: string, amount: number): Promise<number> {
    return this.redis.incrby(key, amount);
  }

  async decr(key: string): Promise<number> {
    return this.redis.decr(key);
  }

  // Pipeline
  pipeline() {
    return this.redis.pipeline();
  }

  // Transactions
  multi() {
    return this.redis.multi();
  }

  // Scan operations (for large datasets)
  async scan(cursor: string | number = 0, pattern?: string): Promise<[string, string[]]> {
    if (pattern) {
      return this.redis.scan(cursor, 'MATCH', pattern);
    }
    return this.redis.scan(cursor);
  }

  // Connection info
  async ping(): Promise<string> {
    return this.redis.ping();
  }

  async info(): Promise<string> {
    return this.redis.info();
  }

  async dbSize(): Promise<number> {
    return this.redis.dbsize();
  }

  async flushDb(): Promise<string> {
    return this.redis.flushdb();
  }

  // Get Redis client for advanced operations
  getClient(): Redis {
    return this.redis;
  }
}
