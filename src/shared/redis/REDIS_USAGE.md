# Redis Integration Guide

## Overview

DomiExpress uses Redis for:
- **Geospatial queries** — Driver location tracking with radius search
- **Caching** — Search results, order data, commerce status
- **Sessions** — User session management
- **Rate limiting** — API rate limiting per client
- **Pub/Sub** — Real-time delivery & order updates
- **Job persistence** — BullMQ queue storage

## Architecture

```
Redis Instance
├── Geospatial Index (drivers:active:locations)
├── String Store (caches, sessions)
├── Hash Store (metadata, session data)
├── List Store (activity logs)
├── Set Store (active users)
└── Pub/Sub Channels (real-time events)
```

## Services

### RedisService
Core Redis operations

```typescript
import { RedisService } from '@shared/redis';

constructor(private redisService: RedisService) {}

// Basic operations
await redisService.get('key');
await redisService.set('key', 'value', 3600); // TTL in seconds
await redisService.del('key');
await redisService.exists('key');

// JSON operations
await redisService.setJson('user:1', userData, 3600);
const user = await redisService.getJson<User>('user:1');

// Geospatial
await redisService.geoAdd('drivers', longitude, latitude, 'driver-1');
const nearby = await redisService.geoRadius('drivers', lon, lat, 5, 'km');
const distance = await redisService.geoDist('drivers', 'driver-1', 'driver-2');

// Pub/Sub
await redisService.publish('channel', 'message');
redisService.subscribe('channel', (msg) => console.log(msg));
```

### CacheService
Application-level caching

```typescript
import { CacheService } from '@shared/redis';

constructor(private cacheService: CacheService) {}

// Get or execute
const products = await cacheService.getOrExecute(
  'products:search:pizza',
  () => searchProducts('pizza'),
  3600 // TTL
);

// Search caching
await cacheService.cacheSearchResults('pizza', municipalityId, results);
const cached = await cacheService.getSearchResults('pizza', municipalityId);

// Invalidate
await cacheService.invalidateSearchCache('pizza', municipalityId);
```

### SessionService
User session management

```typescript
import { SessionService, SessionData } from '@shared/redis';

constructor(private sessionService: SessionService) {}

// Create session
await sessionService.createSession(sessionId, {
  userId: 'user-123',
  userType: 'CUSTOMER',
  municipalityId: 'mun-456',
  ip: '192.168.1.1',
  createdAt: new Date(),
  lastActivity: new Date(),
});

// Get session
const session = await sessionService.getSession(sessionId);

// Update activity
await sessionService.updateLastActivity(sessionId);

// Check validity
const valid = await sessionService.isValidSession(sessionId);

// Destroy
await sessionService.destroySession(sessionId);
```

### RateLimitService
API rate limiting

```typescript
import { RateLimitService } from '@shared/redis';

constructor(private rateLimitService: RateLimitService) {}

// Check if allowed
const result = await rateLimitService.isAllowed(
  `client:${clientId}`,
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  }
);

if (!result.allowed) {
  throw new RateLimitError(result.resetAt);
}

// Get status
const status = await rateLimitService.getStatus(identifier);
console.log(`${status.current}/${status.max} requests`);

// Reset
await rateLimitService.reset(identifier);
```

## Usage Examples

### Location Tracking

```typescript
import { LocationTrackingService } from '@modules/location-tracking';

constructor(private locationService: LocationTrackingService) {}

// Update driver location
await locationService.updateLocation(
  driverId,
  latitude,
  longitude,
  accuracy
);

// Find nearby drivers
const nearby = await locationService.getNearbyDrivers(
  customerLat,
  customerLon,
  5 // radius in km
);

// Track delivery location (for real-time updates)
await locationService.trackDeliveryLocation(
  deliveryId,
  latitude,
  longitude
);
```

### Search Caching

```typescript
// In SearchService
async searchProducts(query: string): Promise<Product[]> {
  // Try cache first
  const cached = await this.cacheService.getSearchResults(
    query,
    this.municipalityId
  );
  
  if (cached) {
    return cached;
  }

  // Execute search (AI or DB)
  const results = await this.executeSearch(query);

  // Cache results
  await this.cacheService.cacheSearchResults(
    query,
    this.municipalityId,
    results
  );

  return results;
}
```

### Real-time Delivery Updates

```typescript
// Subscriber (customer app)
constructor(private redisService: RedisService) {
  this.redisService.subscribe(
    RedisKeys.DELIVERY_UPDATES(deliveryId),
    (message) => {
      const location = JSON.parse(message);
      this.updateMapMarker(location);
    }
  );
}

// Publisher (delivery tracking job)
await this.redisService.publishJson(
  RedisKeys.DELIVERY_UPDATES(deliveryId),
  {
    latitude,
    longitude,
    estimatedArrival,
  }
);
```

## Key Naming Conventions

All Redis keys follow this pattern:

```
entity:action:identifier

Examples:
driver:location:driver-123      // Driver's current location
drivers:active:locations         // All active drivers (geospatial)
session:session-456             // User session data
search:mun-789:pizza            // Cached search results
delivery:tracking:delivery-001  // Delivery tracking data
order:order-123                 // Cached order data
ratelimit:client:192.168.1.1   // Rate limit counter
```

## TTL (Time To Live)

```typescript
// Recommended TTLs
const TTLs = {
  SESSION: 86400,           // 24 hours
  SEARCH_RESULTS: 3600,     // 1 hour
  ORDER_CACHE: 300,         // 5 minutes
  DELIVERY_TRACKING: 3600,  // 1 hour
  COMMERCE_STATUS: 600,     // 10 minutes
  ANALYTICS: 3600,          // 1 hour
  RATE_LIMIT: 900,          // 15 minutes
};
```

## Connection Management

```typescript
// Connection is automatically managed by RedisService
// On module init: connects to Redis
// On module destroy: disconnects gracefully

// Check connection
const pong = await redisService.ping();
console.log(pong); // "PONG"

// Get connection info
const info = await redisService.info();
const size = await redisService.dbSize();
```

## Performance Tips

1. **Use JSON serialization** for complex objects
2. **Set appropriate TTLs** to avoid memory bloat
3. **Batch operations** with pipelines for multiple commands
4. **Use geospatial index** for location queries (efficient)
5. **Monitor memory usage** — `redisService.info()`
6. **Implement cache warming** for frequently accessed data
7. **Use Pub/Sub** for real-time updates (not polling)

## Monitoring

```typescript
// Get Redis statistics
const stats = await redisService.info();

// Check database size
const dbSize = await redisService.dbSize();

// Monitor cache hit/miss
// (implement in CacheService callbacks)
```

## Debugging

### Redis CLI

```bash
# Connect
docker-compose exec redis redis-cli

# Monitor operations
MONITOR

# Check keys
KEYS *
KEYS driver:*
KEYS search:*

# Check memory usage
INFO memory

# Get key TTL
TTL key-name

# Get all data for a key
GET key-name
HGETALL key-name
ZRANGE set-key 0 -1

# Clear database
FLUSHDB

# Get geospatial data
GEORADIUS drivers 74.0721 4.7110 5 km
```

## Troubleshooting

### Connection Issues
```
✗ ECONNREFUSED
→ Check Redis is running: docker-compose ps
→ Check redis port: REDIS_PORT=6379
```

### Out of Memory
```
✗ OOM command not allowed when used memory > 'maxmemory'
→ Implement aggressive TTLs
→ Clear old cache: flushdb
→ Increase Redis memory limit
```

### Slow Queries
```
→ Use MONITOR to identify slow operations
→ Optimize geospatial queries (add indexes)
→ Cache frequently accessed data
```

## Production Checklist

- [ ] Redis persistence enabled (AOF)
- [ ] Memory limits configured
- [ ] Monitoring/alerting set up
- [ ] Backup strategy
- [ ] Replication for HA
- [ ] Key eviction policy set
- [ ] Connection pooling optimized
- [ ] Pub/Sub capacity planned
