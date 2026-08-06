# ETAPA 4: Plan de Desarrollo

## Visión General

Construcción de DomiExpress backend en **5 fases independientes**, cada una entregable, testeable y deployable por separado.

**Principios**:
- ✅ Una fase a la vez (no saltar)
- ✅ Cada fase es 100% funcional (MVP)
- ✅ Tests completos para cada fase
- ✅ Swagger documentado
- ✅ Code review antes de pasar

---

## Fases de Desarrollo

### FASE 1: Autenticación + Gestión de Comercios

**Objetivo**: Clientes y comercios pueden registrarse y autenticarse

**Duración**: 1-2 semanas
**Endpoints**: 20+
**Pruebas**: 50+

#### Módulos Implementados:
```
├─ auth/
│  ├─ controllers/ → Login, register, verify
│  ├─ services/ → Token generation, validation
│  ├─ guards/ → JWT auth guard
│  └─ strategies/ → JWT strategy, local strategy
│
├─ customers/
│  ├─ controllers/ → CRUD operations
│  ├─ services/ → Customer business logic
│  └─ entities/ → Customer entity
│
├─ commerces/
│  ├─ controllers/ → CRUD, catalog management
│  ├─ services/ → Commerce business logic
│  └─ entities/ → Commerce entity
│
└─ shared/
   ├─ database/ → Prisma setup
   ├─ exceptions/ → Custom exceptions
   └─ decorators/ → Auth decorators
```

#### Endpoints Principales:
```
POST   /auth/customer/register       → Register customer
POST   /auth/customer/login          → Login customer
POST   /auth/commerce/register       → Register commerce
POST   /auth/commerce/login          → Login commerce
GET    /auth/verify                  → Verify token
POST   /auth/refresh                 → Refresh token

GET    /customers/:id                → Get customer
PATCH  /customers/:id                → Update customer
POST   /customers/addresses          → Add address
GET    /customers/addresses          → List addresses

GET    /commerces/:id                → Get commerce
PATCH  /commerces/:id                → Update commerce
GET    /commerces/:id/products       → List products
POST   /commerces/products           → Add product
PATCH  /commerces/products/:id       → Update product
DELETE /commerces/products/:id       → Delete product
```

#### DTOs:
```
RegisterCustomerDto
LoginCustomerDto
RegisterCommerceDto
LoginCommerceDto
CreateProductDto
UpdateProductDto
CustomerProfileDto
CommerceProfileDto
```

#### Criterios de Aceptación:
- ✅ Registro funciona sin errores
- ✅ Login devuelve JWT válido
- ✅ JWT auth guard protege endpoints
- ✅ CRUD de productos funciona
- ✅ 90%+ code coverage
- ✅ Swagger documentado
- ✅ Tests de integración pasan

---

### FASE 2: Gestión de Pedidos + Pagos

**Objetivo**: Clientes pueden hacer pedidos y pagarlos

**Duración**: 2-3 semanas
**Endpoints**: 15+
**Pruebas**: 40+

#### Módulos Implementados:
```
├─ orders/
│  ├─ controllers/ → CRUD, state management
│  ├─ services/ → Order business logic
│  ├─ state-machine/ → Order state transitions
│  ├─ entities/ → Order entity
│  └─ repositories/ → Order queries
│
├─ payments/
│  ├─ controllers/ → Webhook handlers
│  ├─ services/ → Payment processing
│  ├─ wompi-client/ → Wompi API integration
│  └─ entities/ → Payment entity
│
└─ notifications/
   ├─ services/ → WhatsApp messaging
   ├─ templates/ → Message templates
   ├─ whatsapp-client/ → WhatsApp API client
   └─ queue-jobs/ → Async notifications
```

#### Endpoints Principales:
```
POST   /orders                       → Create order
GET    /orders/:id                   → Get order
PATCH  /orders/:id/status            → Update status
GET    /orders                       → List customer orders
POST   /orders/:id/cancel            → Cancel order

POST   /payments/:orderId/link       → Generate payment link
POST   /webhooks/wompi/transaction   → Wompi webhook
GET    /payments/:id                 → Get payment status
POST   /payments/:id/refund          → Request refund

POST   /orders/search                → Search products (IA)
GET    /commerces/nearby             → Find nearby commerces
```

#### DTOs:
```
CreateOrderDto
CreateOrderItemDto
UpdateOrderStatusDto
GeneratePaymentLinkDto
PaymentWebhookDto
RefundRequestDto
SearchProductsDto
NearbyCommercesDto
```

#### Criterios de Aceptación:
- ✅ Pedido se crea correctamente
- ✅ Items se agregan al pedido
- ✅ Payment link generado por Wompi
- ✅ Webhook de Wompi procesa pagos
- ✅ Estado del pedido transiciona correctamente
- ✅ Notificaciones se envían a comercios
- ✅ 85%+ code coverage
- ✅ Swagger actualizado

---

### FASE 3: IA + Búsqueda de Productos

**Objetivo**: Clientes pueden buscar productos usando lenguaje natural

**Duración**: 2 semanas
**Endpoints**: 5+
**Pruebas**: 30+

#### Módulos Implementados:
```
├─ search/
│  ├─ controllers/ → Search endpoints
│  ├─ services/ → Search business logic
│  ├─ nlp-client/ → Claude API integration
│  ├─ embeddings/ → pgvector queries
│  └─ repositories/ → Product search queries
│
└─ products/
   ├─ services/ → Product embedding generation
   └─ jobs/ → Background embedding jobs
```

#### Endpoints Principales:
```
POST   /search/products              → Search by text
POST   /search/process-message       → IA message processing
GET    /search/suggestions           → Get suggestions
POST   /products/:id/embedding       → Generate embedding
```

#### DTOs:
```
SearchQueryDto
SearchResultDto
ProcessMessageDto
MessageIntentDto
ProductSuggestionDto
```

#### Criterios de Aceptación:
- ✅ IA entiende intención del cliente
- ✅ Extrae entidades correctamente
- ✅ Búsqueda encuentra productos
- ✅ Embeddings se generan automáticamente
- ✅ Caché funciona (Redis)
- ✅ Latencia <5 segundos
- ✅ 80%+ code coverage
- ✅ Swagger actualizado

---

### FASE 4: Gestión de Domiciliarios + Entregas

**Objetivo**: Domiciliarios aceptan pedidos y realizan entregas

**Duración**: 2-3 semanas
**Endpoints**: 15+
**Pruebas**: 35+

#### Módulos Implementados:
```
├─ drivers/
│  ├─ controllers/ → Driver management
│  ├─ services/ → Driver business logic
│  ├─ entities/ → Driver entity
│  └─ repositories/ → Driver queries
│
├─ deliveries/
│  ├─ controllers/ → Delivery management
│  ├─ services/ → Delivery business logic
│  ├─ entities/ → Delivery entity
│  └─ state-machine/ → Delivery states
│
├─ driver-earnings/
│  ├─ services/ → Earnings calculation
│  └─ repositories/ → Earnings queries
│
└─ location-tracking/
   ├─ services/ → Location updates (Redis)
   └─ gateways/ → WebSocket/Events
```

#### Endpoints Principales:
```
POST   /drivers/register             → Register driver
GET    /drivers/:id                  → Get driver profile
PATCH  /drivers/:id                  → Update driver
POST   /drivers/shift/start          → Start shift
POST   /drivers/shift/end            → End shift

GET    /deliveries                   → List deliveries
POST   /deliveries/:id/accept        → Accept delivery
POST   /deliveries/:id/location      → Update location
POST   /deliveries/:id/complete      → Complete delivery

GET    /drivers/:id/earnings         → Get earnings
GET    /drivers/:id/earnings/history → Earnings history
```

#### DTOs:
```
RegisterDriverDto
UpdateDriverDto
StartShiftDto
AcceptDeliveryDto
UpdateLocationDto
CompleteDeliveryDto
DriverEarningsDto
```

#### Criterios de Aceptación:
- ✅ Driver se registra correctamente
- ✅ Puede aceptar/rechazar entregas
- ✅ Ubicación se actualiza en tiempo real
- ✅ Earnings se calculan correctamente
- ✅ WebSocket/Events funciona
- ✅ Redis almacena ubicaciones
- ✅ 85%+ code coverage
- ✅ Swagger actualizado

---

### FASE 5: Admin Panel + Operaciones

**Objetivo**: Admins pueden gestionar todo el sistema

**Duración**: 2 semanas
**Endpoints**: 20+
**Pruebas**: 25+

#### Módulos Implementados:
```
├─ admin/
│  ├─ controllers/ → Admin endpoints
│  ├─ services/ → Admin business logic
│  ├─ guards/ → Admin-only guard
│  └─ entities/ → Admin user entity
│
├─ municipalities/
│  ├─ controllers/ → Municipality management
│  ├─ services/ → Municipality logic
│  └─ entities/ → Municipality entity
│
├─ disputes/
│  ├─ controllers/ → Dispute resolution
│  ├─ services/ → Dispute logic
│  └─ entities/ → Dispute entity
│
├─ analytics/
│  ├─ controllers/ → Reports
│  ├─ services/ → Analytics logic
│  └─ repositories/ → Aggregations
│
└─ ratings/
   ├─ controllers/ → Rating management
   ├─ services/ → Rating logic
   └─ entities/ → Rating entity
```

#### Endpoints Principales:
```
POST   /admin/municipalities         → Create municipality
PATCH  /admin/municipalities/:id     → Update municipality
GET    /admin/municipalities         → List municipalities

GET    /admin/commerces              → List all commerces
PATCH  /admin/commerces/:id/suspend  → Suspend commerce
GET    /admin/drivers                → List all drivers
PATCH  /admin/drivers/:id/suspend    → Suspend driver

POST   /admin/disputes               → Create dispute
PATCH  /admin/disputes/:id/resolve   → Resolve dispute
GET    /admin/disputes               → List disputes

GET    /admin/analytics/dashboard    → Dashboard metrics
GET    /admin/analytics/orders       → Order analytics
GET    /admin/analytics/revenue      → Revenue analytics
```

#### DTOs:
```
CreateMunicipalityDto
UpdateMunicipalityDto
SuspendCommerceDto
SuspendDriverDto
CreateDisputeDto
ResolveDisputeDto
DashboardMetricsDto
AnalyticsQueryDto
```

#### Criterios de Aceptación:
- ✅ Admin puede gestionar municipios
- ✅ Puede suspender comercios/drivers
- ✅ Puede resolver disputas
- ✅ Puede ver analytics/reportes
- ✅ Todo está auditado
- ✅ 80%+ code coverage
- ✅ Swagger actualizado

---

## Estructura del Proyecto

```
domiexpress-backend/
├── src/
│   ├── main.ts                      # Entry point
│   ├── app.module.ts                # Root module
│   │
│   ├── modules/
│   │   ├── auth/                    # Phase 1
│   │   ├── customers/               # Phase 1
│   │   ├── commerces/               # Phase 1
│   │   ├── products/                # Phase 1
│   │   ├── orders/                  # Phase 2
│   │   ├── payments/                # Phase 2
│   │   ├── notifications/           # Phase 2
│   │   ├── search/                  # Phase 3
│   │   ├── drivers/                 # Phase 4
│   │   ├── deliveries/              # Phase 4
│   │   ├── driver-earnings/         # Phase 4
│   │   ├── location-tracking/       # Phase 4
│   │   ├── admin/                   # Phase 5
│   │   ├── municipalities/          # Phase 5
│   │   ├── disputes/                # Phase 5
│   │   ├── ratings/                 # Phase 5
│   │   └── analytics/               # Phase 5
│   │
│   ├── shared/
│   │   ├── database/                # Prisma
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   └── migrations/
│   │   │   └── prisma.service.ts
│   │   ├── cache/                   # Redis
│   │   ├── queue/                   # BullMQ
│   │   ├── exceptions/              # Custom exceptions
│   │   ├── filters/                 # Exception filters
│   │   ├── interceptors/            # Global interceptors
│   │   ├── guards/                  # Global guards
│   │   ├── decorators/              # Custom decorators
│   │   ├── validators/              # Custom validators
│   │   ├── pipes/                   # Custom pipes
│   │   └── utils/                   # Utility functions
│   │
│   ├── external/
│   │   ├── whatsapp/                # WhatsApp API client
│   │   ├── wompi/                   # Wompi API client
│   │   ├── google-maps/             # Google Maps client
│   │   ├── claude-ai/               # Claude API client
│   │   └── storage/                 # Cloudflare R2 client
│   │
│   ├── events/                      # Domain events
│   │   ├── order-created.event.ts
│   │   ├── payment-completed.event.ts
│   │   └── ...
│   │
│   └── types/                       # Global types
│       └── index.ts
│
├── test/
│   ├── auth.e2e-spec.ts             # Phase 1 tests
│   ├── orders.e2e-spec.ts           # Phase 2 tests
│   ├── search.e2e-spec.ts           # Phase 3 tests
│   ├── deliveries.e2e-spec.ts       # Phase 4 tests
│   └── admin.e2e-spec.ts            # Phase 5 tests
│
├── prisma/
│   ├── schema.prisma                # DB schema
│   └── migrations/                  # DB migrations
│
├── docker-compose.yml               # Local environment
├── .env.example                     # Environment template
├── .eslintrc.js                     # Linting rules
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies
└── README.md                        # Documentation
```

---

## Dependencias (package.json)

```json
{
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/jwt": "^12.0.1",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/typeorm": "^9.0.1",
    "@prisma/client": "^5.8.0",
    "prisma": "^5.8.0",
    "@bull-board/express": "^5.14.5",
    "bull": "^4.11.5",
    "redis": "^4.6.12",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcryptjs": "^2.4.3",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "axios": "^1.6.5",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "swagger-ui-express": "^4.6.3",
    "@nestjs/swagger": "^7.1.16"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.3.0",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "prettier": "^3.1.1",
    "eslint": "^8.56.0"
  }
}
```

---

## Checklist de Aceptación Por Fase

### Fase 1
- [ ] Todos los endpoints implementados
- [ ] DTOs validados
- [ ] Guards de autenticación funcionan
- [ ] Prisma schema migrado
- [ ] 90%+ code coverage
- [ ] Swagger documentado
- [ ] E2E tests pasan
- [ ] No hay eslint warnings
- [ ] Code review aprobado

### Fase 2 (depende de Fase 1)
- [ ] Todos los endpoints implementados
- [ ] State machine funciona
- [ ] Wompi integration funciona
- [ ] WhatsApp notifications se envían
- [ ] 85%+ code coverage
- [ ] Swagger actualizado
- [ ] E2E tests pasan
- [ ] Code review aprobado

### Fase 3 (depende de Fase 2)
- [ ] IA integration funciona
- [ ] Búsqueda devuelve resultados
- [ ] Embeddings generados
- [ ] Cache funciona
- [ ] 80%+ code coverage
- [ ] Latencia <5s
- [ ] Code review aprobado

### Fase 4 (depende de Fase 3)
- [ ] Driver auth funciona
- [ ] Entregas se asignan
- [ ] Ubicación se actualiza
- [ ] Earnings se calculan
- [ ] 85%+ code coverage
- [ ] Code review aprobado

### Fase 5 (depende de Fase 4)
- [ ] Admin endpoints funciona
- [ ] Analytics generan reportes
- [ ] 80%+ code coverage
- [ ] Swagger completo
- [ ] Code review aprobado

---

## Deployment

```
Environment: Staging
- Test todos los endpoints
- Pruebas de carga
- Validar integraciones externas

Environment: Production
- Backup de BD
- Monitoreo activado
- Alertas configuradas
- Rollback plan listo
```

---

**Estado**: Plan listo. Proximamente: Fase 1 - Setup y Auth
