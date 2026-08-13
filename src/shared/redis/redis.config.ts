import Redis from 'ioredis';

export const createRedisClient = (): Redis => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: 0,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    enableReadyCheck: false,
    enableOfflineQueue: true,
  });

  redis.on('error', err => {
    console.error('Redis connection error:', err);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  return redis;
};

// Key naming conventions
export const RedisKeys = {
  // Driver Location (Geospatial)
  DRIVER_LOCATION: (driverId: string) => `driver:location:${driverId}`,
  DRIVERS_ACTIVE: 'drivers:active:locations',

  // Search Cache
  SEARCH_RESULTS: (query: string, municipality: string) => `search:${municipality}:${query}`,
  SEARCH_TTL: 3600, // 1 hour

  // Session
  SESSION: (sessionId: string) => `session:${sessionId}`,
  SESSION_TTL: 86400, // 24 hours

  // Rate Limiting
  RATE_LIMIT: (key: string) => `ratelimit:${key}`,
  RATE_LIMIT_TTL: 900, // 15 minutes

  // Delivery Tracking (Real-time)
  DELIVERY_TRACKING: (deliveryId: string) => `delivery:tracking:${deliveryId}`,
  DELIVERY_TRACKING_TTL: 3600, // 1 hour

  // Order Cache
  ORDER: (orderId: string) => `order:${orderId}`,
  ORDER_TTL: 300, // 5 minutes

  // Commerce Status
  COMMERCE_STATUS: (commerceId: string) => `commerce:${commerceId}`,
  COMMERCE_STATUS_TTL: 600, // 10 minutes

  // Analytics Cache
  ANALYTICS: (key: string) => `analytics:${key}`,
  ANALYTICS_TTL: 3600, // 1 hour

  // Pub/Sub Channels
  DELIVERY_UPDATES: (deliveryId: string) => `delivery:updates:${deliveryId}`,
  ORDER_UPDATES: (orderId: string) => `order:updates:${orderId}`,
  DRIVER_STATUS: (driverId: string) => `driver:status:${driverId}`,
};
