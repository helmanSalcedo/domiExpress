# Observabilidad: Logs, Metrics, Traces

## Principios

- **Observability-First**: Instrumentado desde el inicio
- **Centralized**: Todos los logs en un lugar (DataDog)
- **Actionable**: Metrics y alerts que disparan acciones
- **Cost-Effective**: Solo datos críticos, no todo

---

## Logs

### Niveles de Log

```
ERROR:   Issues que requieren atención inmediata
WARN:    Situaciones anómalas pero no críticas  
INFO:    Eventos importantes (pedidos, pagos)
DEBUG:   Detalles para troubleshooting (development)
```

### What to Log

```
PAYMENT FLOW:
  ✓ Payment initiated
  ✓ Wompi request/response
  ✓ Payment confirmed/failed
  ✓ Refund processed

ORDER FLOW:
  ✓ Order created
  ✓ Commerce accepted/rejected
  ✓ Driver assigned
  ✓ Delivery completed

ERRORS:
  ✓ 4xx errors with details
  ✓ 5xx errors with stack trace
  ✓ External API failures
  ✓ Database connection errors

PERFORMANCE:
  ✓ Slow queries (>1s)
  ✓ Long-running operations (>5s)
  ✓ Queue delays (jobs >average)

DON'T LOG:
  ✗ Customer passwords
  ✗ Full credit card numbers
  ✗ API keys / secrets
  ✗ Personally identifiable information
```

### Log Format

```json
{
  "timestamp": "2024-01-15T18:35:42Z",
  "level": "INFO",
  "service": "payment-service",
  "traceId": "abc-123-def",
  "userId": "CUST-5432",
  "event": "PaymentProcessed",
  "message": "Payment confirmed for order ORD-234",
  "data": {
    "orderId": "ORD-234",
    "amount": 68000,
    "wompiReference": "TX-12345",
    "duration_ms": 245
  },
  "metadata": {
    "environment": "production",
    "pod": "api-1",
    "version": "v1.2.3"
  }
}
```

### Log Aggregation

```
All logs → DataDog Agent → DataDog Central
                           ↓
                    Searchable Dashboard
                           ↓
                    Retention: 15 days
                    (backup to S3: 1 year)
```

---

## Metrics

### Application Metrics

```
HTTP Requests:
  - request_count (by endpoint, method, status)
  - request_duration_ms (p50, p95, p99)
  - active_connections

Database:
  - query_duration_ms
  - query_count (by operation type)
  - connection_pool_usage
  - slow_queries (>1s)

Business:
  - orders_created_per_minute
  - payments_processed_total
  - payment_failures_count
  - average_delivery_time_minutes
  - customer_satisfaction_nps

Queue:
  - bullmq_job_duration_ms
  - bullmq_jobs_completed
  - bullmq_jobs_failed
  - bullmq_queue_size (per queue)

Cache:
  - redis_hit_rate (%)
  - redis_miss_rate (%)
  - redis_memory_usage_bytes
  - cache_invalidation_count

External APIs:
  - whatsapp_request_duration_ms
  - whatsapp_error_rate (%)
  - wompi_request_duration_ms
  - ai_inference_duration_ms
  - maps_api_calls_count
```

### System Metrics

```
Infrastructure:
  - cpu_usage (%)
  - memory_usage (%)
  - disk_usage (%)
  - network_throughput (bytes/s)

Deployment:
  - pod_count (running)
  - pod_restart_count
  - deployment_success_rate (%)
```

### Dashboards

```
Executive Dashboard (updated daily):
  ├─ Orders processed (today)
  ├─ Revenue (today)
  ├─ Active customers
  ├─ System health (uptime %)

Operations Dashboard (real-time):
  ├─ Request rate and errors
  ├─ Queue depths
  ├─ Cache hit rate
  ├─ External API latencies

Business Dashboard (hourly):
  ├─ Orders by commerce
  ├─ Average delivery time
  ├─ Customer satisfaction
  ├─ Revenue by municipality
```

---

## Distributed Tracing

### How It Works

```
Request enters system:
  1. Generate traceId (unique)
  2. Pass through all services
  3. Each service:
     ├─ Logs with traceId
     ├─ Adds span (segment)
     └─ Passes to child service
  4. Collect all spans
  5. Visualize call flow

Example trace: /api/orders
  ├─ API Gateway (10ms)
  ├─ Auth Guard (5ms)
  ├─ Search Service (1200ms)
  │  ├─ Claude API call (1000ms)
  │  └─ DB query (100ms)
  ├─ Order Service (300ms)
  │  ├─ Validation (50ms)
  │  └─ DB insert (200ms)
  └─ Response (50ms)

Total: 1560ms (visible in dashboard)
```

### Span Attributes

```json
{
  "traceId": "abc-123-def",
  "spanId": "span-1",
  "parentSpanId": "span-parent",
  "serviceName": "order-service",
  "operationName": "createOrder",
  "startTime": "2024-01-15T18:35:42Z",
  "endTime": "2024-01-15T18:35:42.300Z",
  "duration_ms": 300,
  "status": "OK",
  "tags": {
    "orderId": "ORD-234",
    "customerId": "CUST-5432"
  }
}
```

---

## Alerting

### Alert Rules

| Alert | Condition | Action |
|-------|-----------|--------|
| **High Error Rate** | >5% in 5min | Page on-call |
| **Payment Failures** | >3 consecutive | Escalate to payment team |
| **Queue Delay** | >1000 jobs pending | Scale workers |
| **Cache Miss Rate** | >30% in 5min | Investigate |
| **High Latency** | p95 >2s for 10min | Check infra |
| **Pod Crash** | Any pod restart | Auto-restart, investigate |
| **DB Connection Pool** | >90% used | Alert |
| **Disk Space** | >85% used | Scale up |

### Severity Levels

```
CRITICAL (Page immediately):
  - Payment system down
  - Database unavailable
  - All pods crashed
  - High error rate (>10%)

WARNING (Investigate in 15 min):
  - Performance degradation
  - Queue backlogs
  - Cache issues

INFO (Track but no action):
  - Deployment events
  - Capacity trends
```

---

## Observability Best Practices

### Instrumentation Checklist

```
☐ Every HTTP endpoint logged (request + response)
☐ Every database query timed
☐ Every external API call timed + status
☐ Every business event logged
☐ Every error with stack trace
☐ Every long operation (>100ms) traced
☐ All traces correlated with traceId
☐ Metrics collected but not overwhelming
```

### What NOT to Do

```
✗ Log too much (log explosion)
✗ Log sensitive data (PII, passwords)
✗ No error handling in logging code itself
✗ Synchronous logging (blocks request)
✗ Log in hot loops
```

### Cost Optimization

```
DataDog pricing: ~$0.05 per 1M ingested events

For DomiExpress:
  - 5000 requests/min = 7.2M/day
  - 1 month = 216M events
  - Cost: ~$10/month

To optimize:
  - Sample high-volume endpoints (10% of traffic)
  - Only log errors + slow queries
  - Archive old logs to S3 (cheaper)
```

---

## Debugging Workflow

### User reports issue: "My order isn't appearing"

```
1. Search logs by traceId or orderId
2. Find request entry point
3. Follow trace through services
   ├─ Did auth pass?
   ├─ Did search happen?
   ├─ Did DB insert happen?
   └─ Did event emit happen?
4. Check timeline (did it take too long somewhere?)
5. Check errors (any exceptions?)
6. Correlate with metrics (was system under load?)
7. Root cause identified
```

---

**Estado**: Arquitecto definida, implementación en ETAPA 4
