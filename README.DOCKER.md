# DomiExpress Docker Setup Guide

Professional Docker & Docker Compose configuration for DomiExpress backend.

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   DomiExpress Stack                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   NestJS     │  │  PostgreSQL  │  │    Redis     │  │
│  │   App        │──│  (Database)  │  │   (Cache)    │  │
│  │  :3000       │  │  :5432       │  │   :6379      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   pgAdmin    │  │ Redis        │                    │
│  │   (Mgmt UI)  │  │ Commander    │                    │
│  │  :5050       │  │ (Mgmt UI)    │                    │
│  │ (dev-only)   │  │ :8081        │                    │
│  └──────────────┘  │ (dev-only)   │                    │
│                    └──────────────┘                    │
│                                                          │
│            domiexpress_network (bridge)                │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Development Setup (Recommended)

```bash
# 1. Copy environment file
cp .env.docker .env

# 2. Start all services (with development UI tools)
docker-compose --profile dev up -d

# 3. Run database migrations
docker-compose exec app npm run db:migrate

# 4. View logs
docker-compose logs -f app
```

**Access points:**
- API: `http://localhost:3000`
- Health Check: `http://localhost:3000/health`
- pgAdmin: `http://localhost:5050` (admin@domiexpress.local / admin_dev_pass)
- Redis Commander: `http://localhost:8081`

### Production Setup

```bash
# 1. Use production environment
cp .env.example .env
# Edit .env with production values

# 2. Start core services only (no dev UI tools)
docker-compose up -d

# 3. Run migrations
docker-compose exec app npm run db:migrate

# 4. Verify health
curl http://localhost:3000/health
```

### Testing Setup

```bash
# Start with test profile to include isolated test databases
docker-compose --profile test up -d

# Run tests
docker-compose exec app npm run test

# Run e2e tests
docker-compose exec app npm run test:e2e
```

## 📋 Services

### Core Services

#### **app** (NestJS Application)
- **Port**: 3000
- **Health**: `/health`
- **Depends on**: postgres, redis
- **Auto-restart**: Yes
- **Resource limits**: 2 CPUs, 1GB RAM

```bash
# View logs
docker-compose logs -f app

# Execute command in container
docker-compose exec app npm run db:migrate

# Shell access
docker-compose exec app sh
```

#### **postgres** (Main Database)
- **Port**: 5432 (host) → 5432 (container)
- **User**: domiexpress
- **Database**: domiexpress_dev
- **Persistence**: postgres_data volume
- **Backup**: Daily recommended

```bash
# Connect directly
docker-compose exec postgres psql -U domiexpress -d domiexpress_dev

# Backup
docker-compose exec postgres pg_dump -U domiexpress domiexpress_dev > backup.sql

# Restore
docker-compose exec -T postgres psql -U domiexpress domiexpress_dev < backup.sql
```

#### **redis** (Cache & Queue)
- **Port**: 6379
- **Persistence**: redis_data volume (AOF enabled)
- **Max Memory**: 256MB with LRU eviction
- **Health Check**: Ping every 10s

```bash
# Connect via redis-cli
docker-compose exec redis redis-cli

# Check memory
docker-compose exec redis redis-cli INFO memory

# Monitor commands
docker-compose exec redis redis-cli MONITOR
```

### Development Tools

#### **pgAdmin** (PostgreSQL Management)
- **URL**: http://localhost:5050
- **Login**: admin@domiexpress.local / admin_dev_pass
- **Profile**: `dev` (add with `--profile dev`)
- **Features**: Query builder, backup, user management

#### **Redis Commander** (Redis Management)
- **URL**: http://localhost:8081
- **Profile**: `dev` (add with `--profile dev`)
- **Features**: Key browser, memory analyzer, slow log

### Test Services (Isolated)

#### **postgres_test**
- **Port**: 5433
- **Profile**: `test`
- **Auto-reset**: Removed with compose down
- **Use**: E2E and integration tests

#### **redis_test**
- **Port**: 6380
- **Profile**: `test`
- **Auto-reset**: Removed with compose down

## 🔧 Common Commands

```bash
# Start services
docker-compose up -d                          # Core only
docker-compose --profile dev up -d            # Dev with UI tools
docker-compose --profile test up -d           # With test databases

# Stop services
docker-compose down                           # Stop & remove containers
docker-compose down -v                        # Stop & remove volumes (CAUTION!)

# View status
docker-compose ps
docker-compose logs app
docker-compose logs -f redis                  # Follow logs

# Access container
docker-compose exec app sh
docker-compose exec postgres psql -U domiexpress

# Database operations
docker-compose exec app npm run db:migrate    # Run migrations
docker-compose exec app npm run db:seed       # Seed data
docker-compose exec app npm run db:reset      # Reset DB (dev only!)

# Rebuild images
docker-compose build --no-cache
docker-compose build app                      # Rebuild only app

# Clean up
docker-compose down -v                        # Remove everything
docker system prune -a                        # Remove all unused resources
```

## 🔑 Environment Variables

All variables are configurable via `.env` file. Key ones:

```bash
# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/dbname

# Redis
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRATION=24h

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=...

# Application
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

See `.env.docker` for all available variables and defaults.

## 📊 Resource Limits

Configured in docker-compose.yml to prevent resource exhaustion:

```yaml
app:
  limits: 2 CPUs, 1GB RAM
  reservations: 1 CPU, 512MB RAM

postgres:
  limits: 1 CPU, 512MB RAM
  reservations: 0.5 CPU, 256MB RAM

redis:
  limits: 0.5 CPU, 256MB RAM
  reservations: 0.25 CPU, 128MB RAM
```

Adjust based on your machine's resources.

## 🔒 Security Best Practices

### Development
- Using test/placeholder credentials in `.env.docker`
- Services only exposed on localhost
- Passwords changed from defaults in docs

### Production
- ✅ Store credentials in `.env` (not in repo)
- ✅ Use strong passwords for PostgreSQL
- ✅ Enable Redis password protection
- ✅ Use environment variables for secrets
- ✅ Don't expose ports externally
- ✅ Use secrets management (Docker Swarm/Kubernetes)
- ✅ Regular backups of databases
- ✅ Monitor logs for suspicious activity

## 📈 Performance Tuning

### PostgreSQL
```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes;

-- Check slow queries
SELECT * FROM pg_stat_statements;
```

### Redis
```bash
# Monitor memory
docker-compose exec redis redis-cli INFO memory

# Check slow log
docker-compose exec redis redis-cli SLOWLOG GET 10

# Monitor connected clients
docker-compose exec redis redis-cli CLIENT LIST
```

### Docker
```bash
# Monitor resource usage
docker stats

# Analyze image layers
docker history domiexpress_app
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Find process using port
lsof -i :3000

# Change ports in docker-compose or .env
APP_PORT=3001 docker-compose up
```

### Container won't start
```bash
# Check logs
docker-compose logs app

# Inspect container
docker-compose exec app sh

# Rebuild
docker-compose build --no-cache app
```

### Database connection refused
```bash
# Ensure postgres is healthy
docker-compose ps
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### Out of disk space
```bash
# Clean up
docker system prune -a --volumes

# Check disk usage
docker system df
```

## 🔄 CI/CD Integration

```bash
# Build image for CI/CD
docker build -t domiexpress:latest .

# Run tests in container
docker-compose run --rm app npm run test

# Generate coverage
docker-compose run --rm app npm run test:cov
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## ✅ Health Checks

All services include health checks:

```bash
# View health status
docker-compose ps

# Manual health check
curl http://localhost:3000/health
docker-compose exec postgres pg_isready -U domiexpress
docker-compose exec redis redis-cli ping
```

Health check failures will automatically restart containers.

---

**Last Updated**: 2026-08-14  
**Docker Compose Version**: 3.9  
**Node Version**: 18-alpine  
**PostgreSQL Version**: 15-alpine  
**Redis Version**: 7-alpine
