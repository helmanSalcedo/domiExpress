# DomiExpress 🚀

**Multi-municipality WhatsApp-first delivery platform with AI-powered search and 10-year scalability**

## 🎯 Overview

DomiExpress is a sophisticated backend platform built with NestJS that powers delivery operations across Colombian municipalities. It features WhatsApp integration, AI-powered natural language search, real-time location tracking, and comprehensive business analytics.

### Key Features
- ✅ **Multi-tenancy by municipality** with isolated data and configuration
- ✅ **WhatsApp-first** interaction model via Meta Cloud API
- ✅ **Event-driven architecture** with 12 specialized job queues (BullMQ)
- ✅ **AI-powered NLU** for natural language search via Claude API
- ✅ **Real-time delivery tracking** with Redis location streaming
- ✅ **Payment processing** with Wompi escrow pattern
- ✅ **Business intelligence** with comprehensive analytics dashboards
- ✅ **99.9% uptime** capable architecture with <500ms p95 latency

---

## 📋 Architecture

### Clean Architecture (4-Layer)
```
Presentation Layer (Controllers)
    ↓
Application Layer (Services, DTOs)
    ↓
Domain Layer (Entities, State Machines)
    ↓
Infrastructure Layer (Database, APIs, External Services)
```

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **Language**: TypeScript 5.3
- **Database**: PostgreSQL 15 (Prisma ORM)
- **Cache/Queue**: Redis 7 (BullMQ)
- **Authentication**: JWT + Passport
- **APIs**: Meta WhatsApp, Anthropic Claude, Wompi
- **Deployment**: Docker + Docker Compose

---

## 📦 Module Structure (18 Modules)

### FASE 1: Core (3 modules)
| Module | Purpose |
|--------|---------|
| **Auth** | JWT authentication for customers & commerces |
| **Customers** | Customer profiles, addresses, preferences |
| **Commerces** | Vendor management, products, operations |

### FASE 2: Transactions (3 modules)
| Module | Purpose |
|--------|---------|
| **Orders** | Order creation, state machine (PENDING→COMPLETED) |
| **Payments** | Wompi integration, payment links, webhooks |
| **Notifications** | WhatsApp message templates & delivery |

### FASE 3: Intelligence (1 module)
| Module | Purpose |
|--------|---------|
| **Search** | Claude NLU for intent extraction, semantic search |

### FASE 4: Operations (4 modules)
| Module | Purpose |
|--------|---------|
| **Drivers** | Registration, shift management, profiles |
| **Deliveries** | Assignment, tracking (PENDING→DELIVERED) |
| **Driver Earnings** | Base fee ($2) + distance + time + rush hour |
| **Location Tracking** | In-memory with Haversine distance calc |

### FASE 5: Administration (4 modules)
| Module | Purpose |
|--------|---------|
| **Municipalities** | Regional configuration, statistics |
| **Ratings** | 1-5 star reviews for drivers & commerces |
| **Disputes** | Complaint resolution workflow |
| **Analytics** | Daily metrics, revenue breakdown, growth tracking |

### Shared Infrastructure (2 modules)
| Module | Purpose |
|--------|---------|
| **Database** | Prisma setup, migrations, schema management |
| **Health** | Liveness/readiness probes for Kubernetes |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd domiExpress

# 2. Copy environment template
cp .env.example .env

# 3. Start services
docker-compose up -d

# 4. Install dependencies
npm install

# 5. Run migrations
npm run db:migrate

# 6. Start development server
npm run start:dev
```

Access at: `http://localhost:3000`
Swagger Docs: `http://localhost:3000/api/docs`

---

## 📚 Documentation

- [Setup Guide](./SETUP.md) — Detailed installation & configuration
- [API Documentation](http://localhost:3000/api/docs) — Interactive Swagger UI
- [Database Schema](./prisma/schema.prisma) — Prisma schema definition
- [Contributing Guide](./CONTRIBUTING.md) — Code standards & PR process

---

## 🔧 Development Commands

```bash
# Server
npm run start:dev        # Watch mode
npm run build           # Production build
npm run start:prod      # Production run

# Database
npm run db:migrate      # Run migrations
npm run db:studio       # Prisma Studio UI
npm run db:reset        # Reset database (deletes data)
npm run db:seed         # Load test data

# Code Quality
npm run typecheck       # TypeScript checking
npm run lint           # ESLint with auto-fix
npm run format         # Prettier formatting

# Testing
npm run test           # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests

# Docker
npm run docker:up     # Start containers
npm run docker:down   # Stop containers
npm run docker:logs   # View logs
```

---

## 🏗️ Project Structure

```
src/
├── modules/               # 18 feature modules
│   ├── auth/             # JWT authentication
│   ├── customers/        # Customer management
│   ├── commerces/        # Commerce management
│   ├── orders/           # Order processing
│   ├── payments/         # Payment processing
│   ├── notifications/    # WhatsApp integration
│   ├── search/           # AI search (Claude)
│   ├── drivers/          # Driver management
│   ├── deliveries/       # Delivery tracking
│   ├── driver-earnings/  # Earnings calculation
│   ├── location-tracking/# Real-time location
│   ├── municipalities/   # Regional management
│   ├── ratings/          # Reviews & ratings
│   ├── disputes/         # Complaint resolution
│   ├── analytics/        # Business intelligence
│   └── health/           # Health checks
├── shared/                # Shared utilities
│   ├── database/          # Prisma setup
│   ├── guards/            # Auth guards
│   ├── pipes/             # Validation
│   └── decorators/        # Custom decorators
├── main.ts               # Application entry
└── app.module.ts         # Root module
```

---

## 🔐 Security Features

- **JWT Authentication** with configurable expiration
- **Password Hashing** with bcryptjs
- **Request Validation** via class-validator
- **CORS Protection** for cross-origin requests
- **Rate Limiting** on public endpoints
- **SQL Injection Prevention** via Prisma ORM
- **Input Sanitization** via DTOs
- **Environment Secrets** via .env management

---

## 📊 Database Design

**Key Features:**
- 3NF normalization with selective denormalization
- Soft deletes for data retention (`deletedAt`)
- Audit trails (`created_by`, `updated_by`)
- Decimal precision for financial data (15,2)
- PostGIS ready for geospatial queries
- Full-text search support via pgvector

**Tables:** 20+ with strategic indexing
**Relationships:** 30+ foreign keys with cascade rules

---

## 🧪 Testing Strategy

```
Unit Tests        → Service logic, utilities
Integration Tests → Database, API endpoints
E2E Tests        → Complete user workflows
```

Run: `npm run test:cov` for coverage report

---

## 🚢 Deployment

### Docker Build
```bash
docker build -t domiexpress:latest .
docker run -p 3000:3000 domiexpress:latest
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL/TLS enabled
- [ ] Rate limiting configured
- [ ] Monitoring setup (logs, metrics)
- [ ] Backup strategy
- [ ] Disaster recovery plan

See [Deployment Guide](./DEPLOYMENT.md) for detailed instructions.

---

## 📈 Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| p95 Latency | <500ms | Query optimization, caching |
| Uptime | 99.9% | Redundancy, health checks |
| Memory | <512MB | Efficient queue management |
| Throughput | 1000 req/s | Connection pooling, scaling |

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes & add tests
3. Run: `npm run lint && npm run test`
4. Commit: `git commit -m "feat: your feature"`
5. Push & open pull request

---

## 📄 License

MIT - See LICENSE file for details

---

## 👥 Support

For issues or questions:
1. Check [Documentation](./SETUP.md)
2. Review [API Docs](http://localhost:3000/api/docs)
3. Open GitHub issue with details

---

## 🎓 Learning Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma ORM Guide](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Jest Testing](https://jestjs.io)
- [Docker Guide](https://docs.docker.com)

---

**Built with ❤️ for Colombian municipalities | DomiExpress 2024**
