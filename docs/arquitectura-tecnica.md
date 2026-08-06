# Arquitectura Técnica de DomiExpress

## Visión General

DomiExpress es un sistema distribuido que orquesta 3 actores (clientes, comercios, domiciliarios) a través de WhatsApp, con pagos en tiempo real, búsqueda basada en IA, y seguimiento GPS en vivo.

**Principios arquitectónicos**:
- **Clean Architecture**: Separación clara de capas
- **Event-Driven**: Eventos entre servicios
- **Scalability-First**: Puede crecer 10x sin rediseño
- **Observability-Built-In**: Logs, metrics, traces desde el inicio
- **Reliability**: Retries, fallbacks, compensation
- **Security-First**: Autenticación, autorización, encriptación en todos lados

---

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
├─────────────────────────────────────────────────────────────────┤
│  WhatsApp API    │  Wompi API      │  Google Maps   │  Claude API│
└──────────┬──────────┬──────────────┬──────────────┬──────────────┘
           │          │              │              │
┌──────────▼──────────▼──────────────▼──────────────▼──────────────┐
│                      CLOUDFLARE EDGE (CDN)                        │
└──────────────────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────┐
│                     LOAD BALANCER (Nginx)                        │
│                  Rate Limiting + Auth Gateway                    │
└──────────┬───────────────────────────────────────────────────────┘
           │
    ┌──────┴──────┬───────────┬───────────┬──────────┐
    │             │           │           │          │
    ▼             ▼           ▼           ▼          ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ NestJS │  │ NestJS │  │ NestJS │  │ NestJS │  │ NestJS │
│ Pod 1  │  │ Pod 2  │  │ Pod 3  │  │ Pod 4  │  │ Pod 5  │
│        │  │        │  │        │  │        │  │        │
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘
    │             │           │           │          │
    └─────────────┴───────────┴───────────┴──────────┘
                   │
    ┌──────────────┴──────────────┬─────────────┐
    │                             │             │
    ▼                             ▼             ▼
┌──────────────────┐    ┌──────────────────┐  ┌──────────┐
│   PostgreSQL     │    │     Redis        │  │   S3/R2  │
│   (Primary DB)   │    │   (Cache/Queues) │  │(Storage) │
└──────────────────┘    └──────────────────┘  └──────────┘
    │                             │
    ├─ Replication ───────────────┤
    │                             │
    ▼                             ▼
┌──────────────────┐    ┌──────────────────┐
│ PostgreSQL Read  │    │ Redis Replica    │
│   (Replica)      │    │   (Replica)      │
└──────────────────┘    └──────────────────┘

MONITORING / LOGGING
├─ DataDog (metrics, traces, logs)
├─ CloudFlare (DNS, DDoS)
└─ Sentry (error tracking)
```

---

## Stack Tecnológico

### Backend

```
Framework:        NestJS 10+ (TypeScript)
ORM:              Prisma 5+
Language:         TypeScript 5+
Runtime:          Node.js 20 LTS
Package Manager:  npm/pnpm
```

### Database

```
Primary:          PostgreSQL 15+ (Neon.tech - serverless)
Caching:          Redis 7+ (UpStash - serverless)
Search:           PostgreSQL pgvector (embeddings)
Full-text:        PostgreSQL built-in
```

### Message Queues

```
Job Queue:        BullMQ (on Redis)
Job Types:        12+ (pagos, entregas, notificaciones, etc.)
Dead Letter:      Yes (failed jobs stored separately)
Concurrency:      Auto-scaled based on load
```

### External APIs

```
WhatsApp:         Meta Cloud API (official)
Payments:         Wompi (PCI-DSS compliant)
Maps:             Google Maps Platform
IA:               Claude API (Anthropic)
Storage:          Cloudflare R2
CDN:              Cloudflare
```

### Deployment

```
Container:        Docker
Orchestration:    Kubernetes (K8s) or Docker Compose (MVP)
Infrastructure:   AWS/Vercel/Railway (evaluando)
CI/CD:            GitHub Actions
```

### Monitoring

```
Logs:             DataDog + ELK
Metrics:          DataDog + Prometheus
Traces:           DataDog APM
Errors:           Sentry
Uptime:           Checkly
```

---

## Arquitectura por Capas

```
┌─────────────────────────────────────────────────────┐
│         PRESENTATION LAYER (HTTP/WebSocket)         │
│  - Controllers (REST endpoints)                      │
│  - Guards (Authentication/Authorization)            │
│  - Interceptors (Logging, Error handling)           │
│  - Filters (Exception mapping)                      │
└──────────────────────┬────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────┐
│         APPLICATION LAYER (Business Logic)        │
│  - Use Case Services (implement cases)             │
│  - DTOs (data transfer objects)                    │
│  - Event Publishers (emit domain events)           │
│  - Validators (business rule enforcement)         │
└──────────────────────┬────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────┐
│       DOMAIN LAYER (Core Business Entities)       │
│  - Entities (Order, Commerce, Driver)             │
│  - Value Objects (Money, Location)                │
│  - Domain Events (OrderCreated, etc.)             │
│  - Specifications (business rules)                │
└──────────────────────┬────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────┐
│       INFRASTRUCTURE LAYER (External I/O)        │
│  - Database Repositories                          │
│  - Cache Services                                 │
│  - Queue Services                                 │
│  - API Clients (WhatsApp, Wompi, Maps, IA)       │
│  - File Storage                                   │
└─────────────────────────────────────────────────┘
```

---

## Módulos Principales

```
src/
├── modules/
│   ├── auth/                    # Authentication & Authorization
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── guards/
│   │   ├── strategies/          # JWT, WhatsApp
│   │   └── entities/
│   │
│   ├── customers/               # Customer management
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── commerces/               # Commerce management
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── drivers/                 # Driver management
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── products/                # Product & Catalog management
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── orders/                  # Order management (state machine)
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── state-machine/       # State transitions
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── payments/                # Payment processing
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── wompi-client/        # Wompi integration
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── deliveries/              # Delivery tracking
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── notifications/           # WhatsApp notifications
│   │   ├── services/
│   │   ├── templates/           # Message templates
│   │   ├── whatsapp-client/     # WhatsApp API client
│   │   └── queue-jobs/
│   │
│   ├── search/                  # IA-powered search
│   │   ├── services/
│   │   ├── nlp-client/          # Claude API client
│   │   ├── embeddings/          # PostgreSQL pgvector
│   │   └── repositories/
│   │
│   ├── ratings/                 # Reviews & Ratings
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── disputes/                # Dispute resolution
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── municipalities/          # Multi-municipality support
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── repositories/
│   │
│   ├── admin/                   # Admin panel & operations
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   └── repositories/
│   │
│   └── analytics/               # Analytics & Reporting
│       ├── controllers/
│       ├── services/
│       └── repositories/
│
├── shared/
│   ├── database/                # Prisma setup
│   │   └── schema.prisma
│   ├── cache/                   # Redis client
│   ├── queue/                   # BullMQ setup
│   ├── exceptions/              # Custom exceptions
│   ├── filters/                 # Global exception filters
│   ├── interceptors/            # Global interceptors
│   ├── guards/                  # Global guards
│   ├── decorators/              # Custom decorators
│   └── utils/                   # Utilities
│
├── external/
│   ├── whatsapp/                # WhatsApp Cloud API client
│   ├── wompi/                   # Wompi payment client
│   ├── google-maps/             # Google Maps client
│   ├── claude-ai/               # Claude API client
│   └── storage/                 # Cloudflare R2 client
│
├── events/                      # Domain events
│   ├── order-created.event.ts
│   ├── payment-confirmed.event.ts
│   ├── delivery-completed.event.ts
│   └── ...
│
└── main.ts                      # Application entry point
```

---

## Flujo de Datos (Request → Response)

```
1. REQUEST INGRESS
   Client (WhatsApp) → Meta Cloud API → Webhook endpoint

2. REQUEST PROCESSING
   HTTP Controller
     ↓
   Guard (Authentication)
     ↓
   Guard (Authorization)
     ↓
   Pipe (Validation)
     ↓
   Use Case Service (Business Logic)
     ↓
   Domain Layer (Entities, Rules)
     ↓
   Repository (Data Access)
     ↓
   Database / Cache

3. RESPONSE
   Service → Controller → Response Interceptor → HTTP Response
   
4. SIDE EFFECTS (Async)
   Event Emitted
     ↓
   Event Listener
     ↓
   Add to Job Queue (BullMQ)
     ↓
   Worker Process
     ↓
   Execute (Send notification, update analytics, etc.)
```

---

## Comunicación Entre Componentes

```
SINCRÓNICO (HTTP):
  Client → API Gateway → NestJS Controller → Service
  
ASINCRÓNICO (Events + Queues):
  Service A → Emit OrderCreated Event
     ↓
  Event Listener B → Add to BullMQ Queue
     ↓
  BullMQ Worker → Process async job
     ↓
  Service C → Update state, send notifications
  
REAL-TIME (WebSocket - Futuro):
  Client → WebSocket → Gateway → Service → Broadcast
```

---

## Integración con APIs Externas

### WhatsApp Cloud API

```
DomiExpress → Meta Cloud API
├── Incoming Messages (Webhook)
│   └── Customer text → NLP processing
├── Outgoing Messages (HTTP)
│   ├── Text responses
│   ├── Interactive buttons
│   ├── Image uploads
│   └── Templates
└── Status webhooks (delivery confirmation)
```

### Wompi (Payments)

```
DomiExpress → Wompi API
├── Generate payment link
├── Receive transaction webhook
├── Process refunds
└── Reconciliation (daily)
```

### Google Maps

```
DomiExpress → Google Maps API
├── Geocoding (address → lat/lng)
├── Distance Matrix (between points)
├── Directions (optimize routes)
└── Static Maps (display on frontend)
```

### Claude API (IA)

```
DomiExpress → Claude API
├── Text generation (understand customer queries)
├── Vision (OCR for menus - future)
└── Embeddings (search via pgvector)
```

---

## Manejo de Errores

### Niveles de Error

```
NIVEL 1: Request Validation
  - Invalid input → 400 Bad Request
  - Missing fields → 422 Unprocessable Entity
  
NIVEL 2: Authentication
  - No token → 401 Unauthorized
  - Invalid token → 401 Unauthorized
  
NIVEL 3: Authorization
  - No permission → 403 Forbidden
  
NIVEL 4: Business Logic
  - Order not found → 404 Not Found
  - Commerce closed → 409 Conflict
  - Insufficient funds → 402 Payment Required
  
NIVEL 5: External APIs
  - Wompi down → 503 Service Unavailable (retry)
  - WhatsApp rate limit → 429 Too Many Requests (backoff)
  - Maps API error → 500 Internal Server Error (retry)
  
NIVEL 6: System
  - Database connection → 500 Internal Server Error
  - Out of memory → 507 Insufficient Storage
```

### Error Response Format

```json
{
  "error": {
    "code": "COMMERCE_CLOSED",
    "message": "El comercio está cerrado en este momento",
    "statusCode": 409,
    "timestamp": "2024-01-15T18:35:42Z",
    "path": "/api/orders",
    "traceId": "abc-123-def"
  }
}
```

---

## Autenticación y Autorización

### Authentication

```
CLIENTE (WhatsApp):
  1. First message → Generate temporary token
  2. Confirm phone → Verify via SMS (future)
  3. Store in Redis (TTL: 30 days)
  4. Every request → Include token in header

COMERCIO:
  1. Register → Assign API key
  2. Store securely (hash in DB)
  3. Every request → Include API key + signature

DOMICILIARIO:
  1. Register → JWT token issued
  2. Store in DomiYa Driver app
  3. Every request → Bearer token
```

### Authorization

```
CLIENTE:
  - Can: View own orders, rate, modify own profile
  - Cannot: See other customers, modify commerces
  
COMERCIO:
  - Can: See own orders, update catalog, view sales
  - Cannot: See other commerces, modify orders (only reject)
  
DOMICILIARIO:
  - Can: Accept deliveries, update location, see own earnings
  - Cannot: Modify orders, see customer details (except delivery)
  
ADMIN:
  - Can: Everything (full access)
  - Cannot: Impersonate users (logged separately)
```

---

## Rate Limiting y Throttling

```
GLOBAL (por IP):
  - 1,000 requests/minuto

POR USUARIO:
  - Customers: 100 requests/minuto
  - Commerces: 500 requests/minuto
  - Drivers: 500 requests/minuto

POR ENDPOINT:
  - Search: 10 requests/minuto (prevent scraping)
  - Payment: 5 requests/minuto (prevent fraud)
  - Login: 5 intentos/minuto (brute force)

ESTRATEGIA:
  - Redis para tracking
  - Token bucket algorithm
  - Exponential backoff en respuestas
```

---

## Seguridad

### Encriptación

```
En Tránsito:
  - HTTPS/TLS 1.3 (todas las APIs)
  - Certificados Let's Encrypt auto-renovados
  
En Reposo:
  - Contraseñas: bcrypt (cost factor 12)
  - Tokens: Firmas HMAC SHA256
  - Datos sensibles: AES-256 (campos de pago)
```

### Auditoría

```
AUDITORIA_FINANCIERA:
  - Toda transacción de dinero
  - Usuario, timestamp, monto, acción
  - Retención: 7 años
  - Acceso: Solo admin + contador
  
AUDITORIA_OPERACIONAL:
  - Cambios de comercio, domiciliario
  - Suspensiones, warnings
  - Acceso: Admin + audit trail viewer
```

### Protección contra Ataques

```
SQL Injection:
  - Usar Prisma (prepared statements)
  - Validación de entrada
  
XSS:
  - No hay frontend web (WhatsApp)
  - Admin panel: sanitizar inputs
  
CSRF:
  - JWT tokens (no cookies)
  - Same-site policy
  
DDoS:
  - Cloudflare protection
  - Rate limiting global
  
Brute Force:
  - Exponential backoff en login
  - IP blacklisting temporal
```

---

**Próxima parte: Eventos, Colas, Redis, Base de Datos**
