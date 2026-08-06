# Seguridad y Escalabilidad

## Seguridad

### Niveles de Defensa

```
NIVEL 1: Perimeter
  - DDoS protection (Cloudflare)
  - TLS/SSL encryption
  - IP whitelisting for internal IPs

NIVEL 2: Application
  - Authentication (JWT, API keys)
  - Authorization (role-based)
  - Input validation & sanitization
  - OWASP compliance

NIVEL 3: Data
  - Database encryption
  - Sensitive field encryption (AES-256)
  - Secure password hashing (bcrypt)
  - Token signing (HMAC)

NIVEL 4: Operations
  - Audit logging
  - Access control
  - Incident response
  - Regular security reviews
```

### Authentication Methods

```
CUSTOMERS:
  - Phone-based (WhatsApp phone number)
  - Temporary session tokens (30 days TTL)
  - Stored in Redis + cookies

COMMERCES:
  - API Key + Signature (HMAC)
  - Store API key hash in DB
  - Rotate keys annually

DRIVERS:
  - JWT tokens (7-day expiry)
  - Stored in app local storage
  - Refresh tokens available

ADMINS:
  - OAuth2 (Google/GitHub)
  - 2FA mandatory
  - Session timeout: 1 hour
  - IP restriction: Whitelisted IPs only
```

### Authorization (Role-Based)

```
CUSTOMER:
  - Can: View own orders, rate, manage profile
  - Cannot: See other customers, modify commerces
  - Endpoint check: @CurrentCustomer() decorator

COMMERCE:
  - Can: Manage catalog, view own orders
  - Cannot: Modify other commerces, manage users
  - Endpoint check: @CurrentCommerce() decorator

DRIVER:
  - Can: Accept deliveries, view own earnings
  - Cannot: Modify order details
  - Endpoint check: @CurrentDriver() decorator

ADMIN:
  - Can: Everything
  - Cannot: Impersonate users (separate audit log)
  - Endpoint check: @Admin() decorator
```

### Data Protection

```
IN TRANSIT:
  - HTTPS 1.3 mandatory (all endpoints)
  - Certificate auto-renewal (Let's Encrypt)
  - HSTS headers (force HTTPS)

AT REST:
  - Database: PostgreSQL native encryption
  - Passwords: bcrypt (cost 12)
  - API keys: bcrypt hash stored
  - Sensitive fields: AES-256-GCM
    ├─ Card tokens (only last 4 digits stored)
    ├─ Social security (if needed in future)
    └─ Government ID (if needed in future)
  - Backups: Encrypted at rest

TOKENS:
  - JWT: Signed with HMAC-SHA256
  - Issued with: exp, iat, sub
  - Revocation: Blacklist in Redis
```

### Vulnerability Management

```
REGULAR SCANNING:
  - Dependency vulnerabilities: npm audit
  - Container scanning: Trivy
  - SAST: SonarQube (code analysis)
  - DAST: Burp Suite (dynamic testing)

FREQUENCY:
  - Dependencies: Weekly
  - Container images: On each push
  - Code: On each commit
  - Infrastructure: Monthly

REMEDIATION:
  - Critical: Fix within 24h
  - High: Fix within 1 week
  - Medium: Fix within 2 weeks
  - Low: Fix within month
```

### Compliance

```
DATA PRIVACY:
  - GDPR-like (right to access, deletion, portability)
  - CCPA ready (disclosure, opt-out)
  - Colombia's personal data law

FINANCIAL:
  - PCI-DSS (payment card industry)
  - We never store full card numbers
  - Wompi handles PCI compliance
  - Only store transaction references

AUDIT:
  - All financial transactions logged
  - 7-year retention
  - Independent audit annually
  - Fraud detection + reporting
```

---

## Escalabilidad

### Load Testing Targets

```
CURRENT (MVP):
  - 100 concurrent users
  - 1,000 orders/day
  - Peak: 10 orders/minute

MONTH 6:
  - 1,000 concurrent users
  - 10,000 orders/day
  - Peak: 100 orders/minute

YEAR 1:
  - 10,000 concurrent users
  - 100,000 orders/day
  - Peak: 1,000 orders/minute
```

### Scaling Strategy

#### Horizontal Scaling (Add Servers)

```
NestJS API Pods:
  MVP: 1 pod
  Month 3: 3 pods (load balanced)
  Month 6: 5 pods
  Year 1: 10+ pods (auto-scaling)

BullMQ Workers:
  MVP: 1 worker (on same pod)
  Month 3: 2 dedicated workers
  Month 6: 5 dedicated workers (by queue type)
  Year 1: 10+ workers (auto-scaling)

Load Balancer:
  Nginx with round-robin
  Health checks every 10s
  Automatic pod removal if unhealthy
```

#### Vertical Scaling (Bigger Servers)

```
DATABASE:
  MVP: t3.small (2 vCPU, 2GB RAM)
  Month 3: t3.medium (2 vCPU, 4GB RAM)
  Month 6: t3.large (2 vCPU, 8GB RAM)
  Year 1: r6i.2xlarge (8 vCPU, 64GB RAM)
  
  + Read replicas added at Month 6
  + Sharding if >10M records at Year 2

REDIS:
  MVP: 256MB (UpStash free tier)
  Month 3: 2GB
  Month 6: 10GB
  Year 1: 50GB (with cluster replication)
```

### Performance Bottlenecks & Solutions

```
BOTTLENECK 1: Database CPU
  Problem: Complex queries at scale
  Solution: 
    - Add read replicas
    - Optimize queries (indexes, explain plans)
    - Cache aggressively
    - Consider data warehouse (Redshift, BigQuery)

BOTTLENECK 2: API Response Time
  Problem: Slow searches (>5s) with scale
  Solution:
    - Elasticsearch for full-text search
    - Denormalization for common queries
    - Batch endpoint processing
    - GraphQL instead of REST (future)

BOTTLENECK 3: Payment Processing
  Problem: Wompi rate limits
  Solution:
    - Queue payments (don't call sync)
    - Batch API calls
    - Use Wompi's webhook notifications
    - Fallback payment method (bank transfer)

BOTTLENECK 4: GPS Tracking
  Problem: Too many location updates
  Solution:
    - Compress location data (every 15s instead of 1s)
    - Store in time-series DB (future: InfluxDB)
    - Aggregate before sending to client (every 3s)
    - Use WebSockets (future)

BOTTLENECK 5: Notification Delivery
  Problem: WhatsApp rate limits
  Solution:
    - Queue all messages (BullMQ)
    - Batch sends when possible
    - Respect rate limits (1000 msg/sec)
    - Fallback to SMS (future)
```

### Performance Targets

```
LATENCY:
  - API response: <500ms (p95)
  - Database query: <100ms (p95)
  - IA inference: <5s (p95)
  - Cache hit: <5ms

THROUGHPUT:
  - Requests/second: 100 (MVP) → 10,000 (Year 1)
  - Orders/second: 1 (MVP) → 100 (Year 1)
  - Messages/second: 10 (MVP) → 1,000 (Year 1)

AVAILABILITY:
  - Uptime: 99.9% (target)
  - Max downtime/month: 43 minutes
  - Planned maintenance: <15 minutes (auto-approved)
  - Incident response: <5 minutes
```

### Database Scaling Strategy

```
PHASE 1 (MVP - single region):
  - 1 PostgreSQL instance
  - 1 Redis instance
  - Backup: Daily snapshots (7-day retention)

PHASE 2 (Multiple municipalities):
  - 1 Primary PostgreSQL (multi-region replication)
  - 1 Read Replica PostgreSQL (read-heavy queries)
  - Redis cluster (3+ nodes)
  - Backup: Daily + weekly archives

PHASE 3 (10+ municipalities):
  - Database sharding by municipality_id
  - Distributed transactions via saga pattern
  - Time-series DB for location tracking
  - Data warehouse for analytics

PHASE 4 (100+ municipalities):
  - Full data partitioning
  - Caching layer (Redis cluster)
  - Separate databases per region
  - Eventual consistency for non-critical data
```

### Redis Scaling

```
MVP: Single instance (256MB)
  └─ No replication

Month 6: Single instance with replica (2GB)
  ├─ Primary: Write operations
  └─ Replica: Read operations (async)

Year 1: Redis Cluster (10GB+)
  ├─ 3 masters (slots distributed)
  ├─ 3 replicas (one per master)
  ├─ Automatic failover
  └─ Linear scaling capability

Provider: UpStash (serverless)
  - No infrastructure to manage
  - Automatic backups
  - Global edge locations
  - Pay-per-request pricing
```

### Auto-Scaling Rules

```
FOR API PODS:
  - Scale up if: CPU >70% for 2 minutes
  - Scale down if: CPU <30% for 10 minutes
  - Min replicas: 2 (HA)
  - Max replicas: 20

FOR BULLMQ WORKERS:
  - Scale up if: Queue size >500 jobs
  - Scale down if: Queue size <100 jobs
  - Min workers: 1
  - Max workers: 10

FOR DATABASE:
  - Scale up if: CPU >80% or connections >80% pool
  - Manual scale (no auto-scale for DB)
  - Add read replicas at >5M records
```

### Monitoring for Scalability

```
METRICS TO WATCH:
  - Request latency trend
  - Queue size trend
  - Cache hit rate trend
  - Database query time trend
  - Error rate trend

ALERTS:
  - Latency increased 20% from baseline
  - Queue growing faster than workers can process
  - Cache hit rate dropped >10%
  - Any critical error spike
  - Pod memory reaching 90%

ACTIONS:
  - Automatic: Scale replicas
  - Manual: Optimize queries, improve cache, adjust rate limits
```

---

## Disaster Recovery

### Backup Strategy

```
DATABASE:
  - Automated: Every 6 hours
  - Retention: 30 days (recent), 1 year (archives)
  - Location: Multi-region (S3)
  - Tested: Monthly restore drill

REDIS:
  - Automated: Every 12 hours
  - Retention: 7 days
  - Recoverable: Full rebuild from database

LOGS:
  - Archived to S3 (30 days recent, 1 year archives)
  - Retention driven by compliance (7 years for financial)

CODE:
  - Stored in GitHub (private repo)
  - Protected main branch
  - Tagged releases
```

### Recovery Procedures

```
SCENARIO 1: Database corrupted
  Time to recover: <1 hour
  - Restore from latest backup
  - Validate data integrity
  - Replay recent transactions from logs

SCENARIO 2: Entire region down
  Time to recover: <2 hours
  - Failover to standby region
  - Update DNS (Cloudflare)
  - Restore from backup if needed

SCENARIO 3: Ransomware / Data breach
  Time to respond: <30 minutes
  - Isolate affected systems
  - Enable read-only mode
  - Notify users + regulators (per law)
  - Restore from clean backup
```

### Incident Response

```
DETECTION:
  - Automated alerts via DataDog
  - Manual escalation threshold
  - User reports (form on website)

RESPONSE:
  1. Acknowledge incident (<2 min)
  2. Assign incident commander
  3. Communicate status (every 15 min)
  4. Investigate root cause
  5. Implement fix
  6. Deploy + test
  7. Verify resolution
  8. Post-mortem (24h later)
```

---

**Estado**: Arquitectura definida, implementación en ETAPA 4
