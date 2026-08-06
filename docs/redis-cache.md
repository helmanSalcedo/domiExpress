# Estrategia de Caching con Redis

## Arquitectura de Redis

```
┌─────────────────────────────────────────┐
│   NestJS Application (5 instances)       │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │ All read    │ ← Write-through cache
        │ queries     │
        ▼             ▼
    ┌─────────────────────────┐
    │  Redis Instance         │  ← Primary
    │  (UpStash Serverless)   │
    └─────────────┬───────────┘
                  │
                  ▼
          ┌──────────────┐
          │ Replication  │  ← Backup
          │ (Async)      │
          └──────────────┘

TTL Strategy:
  - Hot data (order status): 5-10 minutes
  - Product catalogs: 1 hour
  - User profiles: 30 minutes
  - Search results: 1 hour
  - Session tokens: 30 days
  - Rate limit counters: 1 minute
```

---

## Uso de Cache por Entidad

### 1. Order Caching

```
Key: "order:{orderId}"
Value: {
  orderId, customerId, commerceIds[],
  status, totalAmount, location,
  createdAt, updatedAt
}
TTL: 5 minutes (orden activa)

Invalidación:
  - OrderCreated → SET
  - OrderRejected → DELETE (no visible)
  - OrderCompleted → DELETE (30 min después)

Hit Rate Target: 80%
```

### 2. Product/Catalog Caching

```
Key: "commerce:{commerceId}:catalog"
Value: {
  products: [{id, name, price, category, ...}],
  categories: [],
  lastUpdated: timestamp
}
TTL: 1 hour

Invalidación:
  - CatalogUpdated → DELETE (recarga en próxima consulta)

Hit Rate Target: 90%
```

### 3. Location/Distance Caching

```
Key: "distance:{from_lat}:{from_lng}:{to_lat}:{to_lng}"
Value: {
  distance_km: number,
  estimatedTime_minutes: number
}
TTL: 24 hours (distancias no cambian)

Uso: Evitar llamadas frecuentes a Google Maps

Hit Rate Target: 85%
```

### 4. Search Results Caching

```
Key: "search:{municipalityId}:{query_hash}"
Value: {
  products: [{id, name, commerce, price, ...}],
  count: number,
  timestamp: date
}
TTL: 1 hour

Query hash: SHA256(query + filters)

Invalidación:
  - CatalogUpdated en algún comercio → DELETE todos los searches

Hit Rate Target: 70%
```

### 5. User/Customer Caching

```
Key: "customer:{customerId}"
Value: {
  id, phone, name, email, preferences,
  rating, totalOrders, createdAt
}
TTL: 30 minutes

Invalidación:
  - CustomerUpdated → DELETE

Hit Rate Target: 75%
```

### 6. Session Token Caching

```
Key: "session:{token}"
Value: {
  customerId, tokenType, permissions,
  expiresAt, createdAt, ipAddress
}
TTL: 30 days (o custom según token type)

Uso: Fast auth without DB lookup

Hit Rate Target: 95%
```

### 7. Rate Limit Counters

```
Key: "ratelimit:{userId}:{endpoint}"
Value: number (request count)
TTL: 1 minute (rolling window)

Strategy: Token bucket algorithm
  - Initial: 100 tokens
  - Refill: 100/minute
  - Check: Before every request

Hit Rate Target: 100%
```

### 8. Driver Availability

```
Key: "driver:{driverId}:availability"
Value: {
  status: 'available' | 'busy' | 'offline',
  location: {lat, lng},
  activeOrderId: string (if busy),
  timestamp: date
}
TTL: 1 hour (auto-expire if no update)

Usage: Find drivers in range without DB query

Update frequency: Every 15 seconds
```

---

## Estrategias de Invalidación

### Write-Through

```
Customer updates profile:
  1. Update DB
  2. Update Redis cache
  3. Return response

Ventaja: Cache siempre consistente
Desventaja: Latencia de escritura
```

### Cache-Aside

```
Read customer profile:
  1. Check Redis
  2. If hit: Return
  3. If miss: Query DB
  4. Update Redis
  5. Return

Ventaja: Escritura rápida (solo DB)
Desventaja: Posible inconsistencia temporal
```

### Time-Based (TTL)

```
Todos los valores tienen TTL:
  - Expire automáticamente
  - Recarga en siguiente acceso
  - No requiere lógica especial

Ventaja: Simple, no fallos de invalidación
Desventaja: Datos stale posibles
```

### Event-Based

```
Cuando evento emitido:
  - OrderCreated → Invalidar búsquedas relacionadas
  - CatalogUpdated → Invalidar catálogo en cache
  - RatingUpdated → Invalidar comercio/driver

Ventaja: Invalidación inmediata
Desventaja: Más complejidad
```

---

## Monitoreo de Cache

### Métricas

```
Cache Hit Rate: (hits / (hits + misses)) × 100
  Target: >75% (varía por entity type)

Cache Miss Rate: (misses / (hits + misses)) × 100
  Target: <25%

Memory Usage:
  Current: < 80% capacity
  Alert: > 90%

Eviction Rate:
  Target: < 1% (muy pocas evictions)
  Alert: > 5%

Response Time:
  Cache hit: <5ms
  Cache miss: <100ms
  Alert: >200ms
```

### Commands para Admin

```
redis-cli INFO stats         # Ver hit rate
redis-cli MONITOR            # Ver todas las operaciones
redis-cli KEYS "order:*"    # Ver todas las órdenes cacheadas
redis-cli FLUSHALL          # PELIGROSO: Limpiar todo
redis-cli --memkeys         # Ver memory por key pattern
```

---

## Problemas Comunes y Soluciones

### Problema: Cache Stampede

```
Escenario:
  - 1000 clientes buscan mismo producto
  - Cache expira exactamente al mismo tiempo
  - Todos intentan recargar simultáneamente
  - Picos de DB traffic

Solución:
  - Probabilistic early expiration
  - Stale-while-revalidate pattern
  - Lock pattern (solo uno recarga)
```

### Problema: Cache Invalidation

```
Problema (Phil Karlton):
  "There are two hard things in CS:
   Cache invalidation and naming things"

Soluciones implementadas:
  - TTL automático (no esperar invalidación)
  - Event-based para datos críticos
  - Version keys (v1, v2, v3)
  - Tag-based invalidation (futuro)
```

### Problema: Memory Overflow

```
Escenario:
  - Redis usa >90% de memoria
  - Nuevas keys no pueden insertarse
  - Aplicación falla

Monitoreo:
  - Alert si >80% capacity
  - Healthcheck endpoint que verifica Redis
  - Auto-scaling del Redis cluster

Remedies:
  - Reducir TTL global
  - Implementar LRU eviction policy
  - Escalar Redis (agregar replicas)
```

---

## Configuración Recomendada

### Para Desarrollo (Local)

```
Redis in Docker:
  - Version: 7.0+
  - Port: 6379
  - Memory: 256MB
  - TTL: Enabled
  - RDB persistence: Off
  - AOF persistence: Off
```

### Para Producción (UpStash)

```
UpStash Serverless Redis:
  - Pricing: Pay-per-request
  - Latency: <20ms (global edge)
  - Availability: 99.99% SLA
  - Replication: Automatic
  - Backup: Automatic daily
  - Concurrency: Unlimited
  - Max size: 10GB (escable)

Connection:
  - TLS enabled
  - IP whitelist (NestJS server IPs)
  - Auth: Strong token
```

---

## Warm-up de Cache

Al iniciar servidor:

```
1. Cargar hot products (top 100)
2. Cargar municipios configurados
3. Precargar templates de WhatsApp
4. Precargar configuraciones globales

Tiempo: <5 segundos
Evita: Cache misses iniciales
```

---

**Estado**: Implementación en ETAPA 4
