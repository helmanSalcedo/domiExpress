import { E2eTestHelper } from './helpers/e2e.helper';
import { RedisService } from '../src/shared/redis/services/redis.service';
import { RedisKeys } from '../src/shared/redis/redis.config';

describe('Redis & Queue Integration E2E', () => {
  let helper: E2eTestHelper;
  let redisService: RedisService;

  beforeAll(async () => {
    helper = new E2eTestHelper();
    await helper.setup();

    // Get Redis service from app
    redisService = helper.getApp().get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await helper.cleanup();
  });

  describe('Redis Cache Service', () => {
    it('should cache and retrieve data', async () => {
      const key = 'test:cache:key';
      const value = { id: 1, name: 'Test' };

      await redisService.setJson(key, value, 3600);
      const cached = await redisService.getJson(key);

      expect(cached).toEqual(value);
    });

    it('should respect TTL', async () => {
      const key = 'test:ttl:key';
      const value = { data: 'test' };

      await redisService.setJson(key, value, 1); // 1 second TTL
      expect(await redisService.getJson(key)).toEqual(value);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(await redisService.getJson(key)).toBeNull();
    });

    it('should handle JSON operations correctly', async () => {
      const complexData = {
        id: 'test-123',
        nested: {
          array: [1, 2, 3],
          bool: true,
        },
        timestamp: new Date().toISOString(),
      };

      await redisService.setJson('complex', complexData, 3600);
      const retrieved = await redisService.getJson(complexData);

      expect(retrieved).toBeTruthy();
    });
  });

  describe('Geospatial Operations', () => {
    it('should add and retrieve geospatial data', async () => {
      const key = 'test:drivers';

      // Add driver locations
      await redisService.geoAdd(key, -74.0721, 4.711, 'driver-1');
      await redisService.geoAdd(key, -74.072, 4.7115, 'driver-2');
      await redisService.geoAdd(key, -74.0725, 4.7105, 'driver-3');

      // Find nearby drivers
      const nearby = await redisService.geoRadius(key, -74.0721, 4.711, 1, 'km');

      expect(nearby.length).toBeGreaterThan(0);
      expect(nearby).toContain('driver-1');
    });

    it('should calculate distance between locations', async () => {
      const key = 'test:distance';

      await redisService.geoAdd(key, 0, 0, 'point1');
      await redisService.geoAdd(key, 0, 1, 'point2');

      const distance = await redisService.geoDist(key, 'point1', 'point2', 'km');

      expect(distance).toBeTruthy();
      expect(parseFloat(distance!)).toBeGreaterThan(0);
    });
  });

  describe('Session Management', () => {
    it('should store and retrieve sessions', async () => {
      const sessionId = 'test-session-123';
      const sessionData = {
        userId: 'user-1',
        userType: 'CUSTOMER',
        municipalityId: 'mun-1',
        createdAt: new Date(),
        lastActivity: new Date(),
      };

      const key = RedisKeys.SESSION(sessionId);
      await redisService.setJson(key, sessionData, 3600);
      const retrieved = await redisService.getJson(key);

      expect(retrieved).toEqual(sessionData);
    });
  });

  describe('Rate Limiting', () => {
    it('should track and limit requests', async () => {
      const identifier = 'test:client:1';
      let requestCount = 0;

      // Simulate requests
      for (let i = 0; i < 5; i++) {
        const key = RedisKeys.RATE_LIMIT(identifier);
        const current = await redisService.incr(key);

        if (i === 0) {
          await redisService.expire(key, 60); // 1 minute window
        }

        if (current <= 5) {
          requestCount++;
        }
      }

      expect(requestCount).toBe(5);

      // Check current count
      const key = RedisKeys.RATE_LIMIT(identifier);
      const current = parseInt((await redisService.get(key)) || '0', 10);
      expect(current).toBe(5);
    });
  });

  describe('Pub/Sub Messages', () => {
    it('should publish and receive messages', async () => {
      const channel = 'test:channel';
      let receivedMessage: string | null = null;

      // Subscribe to channel
      redisService.subscribe(channel, msg => {
        receivedMessage = msg;
      });

      // Wait for subscription
      await new Promise(resolve => setTimeout(resolve, 100));

      // Publish message
      await redisService.publish(channel, 'Hello World');

      // Wait for delivery
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedMessage).toBe('Hello World');
    });

    it('should publish JSON messages', async () => {
      const channel = 'test:json:channel';
      let receivedData: any = null;

      redisService.subscribe(channel, msg => {
        receivedData = JSON.parse(msg);
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const testData = { orderId: '123', status: 'DELIVERED' };
      await redisService.publishJson(channel, testData);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedData).toEqual(testData);
    });
  });

  describe('Atomic Operations', () => {
    it('should increment counters atomically', async () => {
      const key = 'test:counter';

      // Clear key
      await redisService.del(key);

      // Increment multiple times
      await redisService.incr(key);
      await redisService.incr(key);
      const count = await redisService.incr(key);

      expect(count).toBe(3);
    });
  });
});
