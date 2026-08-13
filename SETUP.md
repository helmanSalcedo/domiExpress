# DomiExpress Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (via Docker)
- Redis 7 (via Docker)

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Update .env with your configuration:
# - Database credentials
# - API keys (WhatsApp, Claude, Wompi)
# - JWT secret
```

### 3. Start Docker Services
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker-compose ps

# Check PostgreSQL is ready
docker-compose exec postgres pg_isready -U domiexpress
```

### 4. Database Migration
```bash
# Create and run migrations
npx prisma migrate dev --name init

# Seed database with initial data
npx prisma db seed
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Build Project
```bash
npm run build
```

### 7. Start Development Server
```bash
npm run start:dev
```

Server runs on: `http://localhost:3000`
API Docs: `http://localhost:3000/api/docs`

---

## Database Commands

### View Database
```bash
npx prisma studio
```

### Reset Database (WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

### Create New Migration
```bash
npx prisma migrate dev --name <migration_name>
```

### Generate Prisma Client
```bash
npx prisma generate
```

---

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U domiexpress -d domiexpress_dev
```

### Access Redis CLI
```bash
docker-compose exec redis redis-cli
```

---

## Testing

### Run Unit Tests
```bash
npm run test
```

### Run Integration Tests
```bash
npm run test:integration
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Watch Mode
```bash
npm run test:watch
```

---

## Development

### Code Quality
```bash
# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

### Build
```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod
```

---

## Environment Variables Reference

### Core
- `NODE_ENV`: development|staging|production
- `PORT`: Server port (default: 3000)

### Database
- `DATABASE_URL`: PostgreSQL connection string
- `DATABASE_URL_TEST`: Test database URL

### Authentication
- `JWT_SECRET`: Secret key for JWT signing (min 32 chars)
- `JWT_EXPIRATION`: Token expiration time (default: 24h)

### External APIs
- `WHATSAPP_API_KEY`: Meta WhatsApp Business API key
- `CLAUDE_API_KEY`: Anthropic Claude API key
- `WOMPI_PRIVATE_KEY`: Wompi payment processor key

### Infrastructure
- `REDIS_URL`: Redis connection string
- `REDIS_PORT`: Redis port (default: 6379)

### AWS (Optional)
- `AWS_ACCESS_KEY_ID`: AWS credentials
- `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `AWS_S3_BUCKET`: S3 bucket for uploads

---

## Architecture Overview

```
src/
├── modules/          # Feature modules (18 total)
│   ├── auth/        # Authentication & JWT
│   ├── customers/   # Customer management
│   ├── commerces/   # Commerce/vendor management
│   ├── orders/      # Order management
│   ├── payments/    # Payment processing (Wompi)
│   ├── notifications/ # WhatsApp notifications
│   ├── search/      # AI-powered search (Claude)
│   ├── drivers/     # Driver management
│   ├── deliveries/  # Delivery tracking
│   ├── driver-earnings/ # Earnings calculation
│   ├── location-tracking/ # Real-time location
│   ├── municipalities/ # Region management
│   ├── ratings/     # Customer feedback
│   ├── disputes/    # Complaint resolution
│   └── analytics/   # Business intelligence
├── shared/          # Shared utilities
│   ├── database/    # Prisma setup
│   ├── guards/      # Auth guards
│   └── pipes/       # Validation pipes
└── main.ts         # App entry point
```

---

## Troubleshooting

### Docker Issues
```bash
# Clean up Docker
docker system prune -a

# Rebuild containers
docker-compose up -d --build
```

### Database Issues
```bash
# Reset migrations
npx prisma migrate reset

# Recreate schema
npx prisma db push
```

### Port Already in Use
```bash
# Change port in .env
PORT=3001

# Or kill process using port
lsof -i :3000
kill -9 <PID>
```

---

## Production Deployment

See `DEPLOYMENT.md` for production setup instructions.
