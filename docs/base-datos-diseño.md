# Diseño de Base de Datos

## Principios de Diseño

### 1. Normalization (hasta 3NF)

```
OBJETIVO: Evitar redundancia, mantener integridad referencial
REGLA: Cada tabla tiene una única responsabilidad

1NF (First Normal Form):
  ✓ Valores atómicos (sin arrays en columnas)
  ✓ Sin columnas multivaluadas
  
2NF (Second Normal Form):
  ✓ Cumple 1NF
  ✓ Atributos no-key dependen de la llave primaria completa
  
3NF (Third Normal Form):
  ✓ Cumple 2NF
  ✓ Sin dependencias transitivas entre atributos no-key
```

### 2. Denormalization Selectiva (Performance)

```
Permitido para:
  - Caché de datos calculados (invoice_total)
  - Contadores frequentes (order_count)
  - Búsquedas repetidas (last_known_location)
  
Estrategia:
  - Denormalizar SOLO si read >> write
  - Mantener sincronía con triggers o eventos
  - Documentar razón de cada denormalización
```

### 3. Soft Deletes

```
NO deletear datos, solo marcar como inactivos:
  - deleted_at: nullable timestamp
  - Razón: Auditoría, compliance, recovery
  
Queries:
  - Por default: WHERE deleted_at IS NULL
  - Admins pueden ver soft-deleted
```

### 4. Audit Trail (Temporal Data)

```
Cada tabla crítica tiene:
  - created_at: timestamp (immutable)
  - updated_at: timestamp (auto update)
  - created_by: user_id (quien creó)
  - updated_by: user_id (quien modificó)
  
Excepciones:
  - Tablas de caché (no auditar)
  - Tablas temporales (no auditar)
```

### 5. Particionamiento (Futuro, Year 2)

```
AHORA (MVP): Single table
  └─ PostgreSQL handles up to 100M rows efficiently

MONTH 6: Range partitioning by date
  ├─ orders: Partition by order_date (monthly)
  └─ deliveries: Partition by delivery_date (monthly)

YEAR 2: Composite partitioning
  ├─ By municipality_id + date
  └─ Sharding at application layer (Prisma)
```

---

## Estrategia de Datos

### Multi-Tenancy por Municipio

```
NIVEL: Application-level (no database-level sharding aún)

Estrategia:
  - Cada tabla tiene municipality_id (foreign key)
  - Queries siempre filtran por municipio
  - Índices en (municipality_id, xxx)
  - Eventual sharding en Year 2

Ventajas:
  - Simple hoy
  - Data locality mañana
  - Fácil de escalar
```

### Location Data

```
Almacenamiento:
  - customer.home_location: Point (lat, lng) → PostGIS
  - commerce.location: Point (lat, lng) → PostGIS
  - driver.current_location: Stored in Redis (not DB)
  
Por qué Redis para current_location?
  - Actualiza cada 15 segundos
  - No necesita persistencia permanente
  - Reduce load en PostgreSQL
  - Time-series future: InfluxDB
```

### Enum Storage

```
OPTION 1: Text (más legible)
  status: VARCHAR(50) CHECK (status IN ('PENDING', 'COMPLETED'))
  
OPTION 2: Integer (más rápido)
  status: SMALLINT (1=PENDING, 2=COMPLETED)
  
ELEGIMOS: Text (legibilidad > micro-performance)
  - PostgreSQL tiene type checking nativo
  - Logs son más claros
  - Debugging es más fácil
```

### Indexing Strategy

```
TIPOS:
  - B-Tree (default, range queries)
  - Hash (exact match queries)
  - GiST (PostGIS, full-text)
  - GIN (full-text, jsonb)

REGLA: Solo indexar si helps queries in hot paths
  - NOT: "Just in case"
  - Costo: Storage + INSERT/UPDATE overhead

ANÁLISIS:
  - EXPLAIN ANALYZE before indexing
  - Monitor index usage: pg_stat_user_indexes
```

---

## Entidades Principales (25+)

```
CORE BUSINESS:
  ├─ customers (usuarios)
  ├─ municipalities (municipios)
  ├─ commerces (tiendas/restaurantes)
  ├─ products (productos)
  ├─ orders (pedidos)
  ├─ order_items (items en pedido)
  ├─ drivers (domiciliarios)
  └─ deliveries (entregas)

PAYMENTS & FINANCIAL:
  ├─ payments (transacciones)
  ├─ refunds (reembolsos)
  ├─ driver_earnings (ganancias domiciliarios)
  └─ commerce_liquidations (liquidaciones)

USER MANAGEMENT:
  ├─ customer_addresses (múltiples direcciones)
  ├─ customer_preferences (preferencias)
  ├─ driver_documents (documentación)
  └─ admin_users (usuarios admin)

OPERATIONS:
  ├─ order_states (historial de estados)
  ├─ delivery_locations (track de ubicación)
  ├─ ratings (calificaciones)
  ├─ disputes (reclamaciones)
  └─ blacklist (usuarios/comercios bloqueados)

CATALOG & SEARCH:
  ├─ categories (categorías)
  ├─ product_variants (variantes)
  ├─ product_embeddings (para búsqueda IA)
  └─ search_logs (analytics de búsqueda)

CONFIGURATION:
  ├─ municipality_config (config por municipio)
  └─ system_settings (config global)
```

---

## Relaciones Principales

```
customers (1) → (M) orders
  "Un cliente puede tener múltiples pedidos"
  DELETE: Cascade (pero con soft delete)

orders (1) → (M) order_items
  "Un pedido contiene múltiples items"
  DELETE: Cascade

order_items (1) → (1) products
  "Cada item apunta a un producto"
  DELETE: Restrict (no deletear producto si está en pedido)

orders (1) → (1) deliveries
  "Un pedido tiene una entrega"
  DELETE: Cascade

deliveries (1) → (1) drivers
  "Una entrega es realizada por un domiciliario"
  DELETE: Restrict

orders (M) → (M) commerces
  "Un pedido puede tener items de múltiples comercios"
  DELETE: Cascade

commerces (1) → (M) products
  "Un comercio tiene múltiples productos"
  DELETE: Cascade

customers (1) → (M) customer_addresses
  "Un cliente puede tener múltiples direcciones"
  DELETE: Cascade

drivers (1) → (M) driver_earnings
  "Un domiciliario tiene múltiples registros de ganancias"
  DELETE: Cascade

orders (1) → (M) order_states
  "Un pedido tiene historial de cambios de estado"
  DELETE: Cascade

orders (1) → (1) payments
  "Un pedido tiene un pago (o null si cancelado)"
  DELETE: Restrict

payments (1) → (M) refunds
  "Un pago puede tener múltiples reembolsos"
  DELETE: Cascade

orders (1) → (M) ratings
  "Un pedido tiene ratings (cliente, comercio, driver)"
  DELETE: Cascade

orders (1) → (M) disputes
  "Un pedido puede tener disputas"
  DELETE: Cascade

all tables (M) → (1) municipalities
  "Todas las entidades pertenecen a un municipio"
  DELETE: Restrict (municipio no puede deletarse si tiene data)
```

---

## Secuencias de IDs

### Por qué NO usar Auto-Increment

```
Problema:
  - Secuencial predecible (security)
  - No idempotente (generar ID 2x = 2 IDs)
  - Difícil de shard

Solución: UUIDs v7 (con timestamp)
  - Sorteable by timestamp
  - Distribuido (no collision)
  - Idempotent (same input = same UUID)
```

### UUID Strategy

```
Format: UUID v7 (RFC 4122)
  └─ Timestamp-based, random component

Generated:
  - Client-side: Para idempotency
  - Server-side: Si no tiene client ID

Almacenamiento:
  - VARCHAR(36) o UUID type nativo PostgreSQL
  - Índice: B-Tree (uuid type es rápido)

Ejemplos:
  order_id:     "ORD-" + uuid_short (visual in logs)
  customer_id:  uuid
  payment_id:   "PAY-" + uuid_short
```

---

## Constraint Strategy

### PRIMARY KEYS

```
customers:
  id: UUID PRIMARY KEY

orders:
  id: UUID PRIMARY KEY
  (NO composite keys para simplificar)
```

### UNIQUE CONSTRAINTS

```
customers:
  phone: UNIQUE (WhatsApp phone)
  email: UNIQUE (opcional, pueden duplicate)

commerces:
  api_key: UNIQUE
  whatsapp_number: UNIQUE (por municipio)

payments:
  wompi_reference: UNIQUE (external ID)
```

### FOREIGN KEYS

```
orders:
  customer_id: FK → customers (CASCADE)
  municipality_id: FK → municipalities (RESTRICT)

order_items:
  order_id: FK → orders (CASCADE)
  product_id: FK → products (RESTRICT)

deliveries:
  order_id: FK → orders (CASCADE)
  driver_id: FK → drivers (RESTRICT)
```

### CHECK CONSTRAINTS

```
orders:
  total_amount > 0
  status IN ('PENDING', 'CONFIRMED', ...)

customers:
  rating >= 1 AND rating <= 5

drivers:
  commission_percentage >= 0 AND commission_percentage <= 100
```

---

## Data Types

### Common Types

```
IDs:                   UUID (or TEXT for prefixed)
Amounts:               DECIMAL(12, 2) (never FLOAT)
Ratings:               NUMERIC(2,1) (1.0 - 5.0)
Percentages:           NUMERIC(5,2) (0.00 - 100.00)
URLs:                  TEXT (or VARCHAR(2048))
Descriptions:          TEXT (unlimited)
Status/Enums:          VARCHAR(50) with CHECK
Timestamps:            TIMESTAMP WITH TIME ZONE
Locations:             POINT (PostGIS type)
Coordinates:           FLOAT (lat/lng, -180 to 180)
Phone:                 VARCHAR(20) (with country code)
Flags:                 BOOLEAN
```

### JSON/JSONB Storage

```
WHEN TO USE:
  ✗ Customer preferences (just columns)
  ✗ Order items (just separate table)
  ✓ Extra metadata (if totally optional)
  ✓ Product specifications (if dynamic)

EXAMPLE - Product specs:
  products.specifications: JSONB
  {
    "ingredients": ["flour", "sugar"],
    "allergens": ["gluten"],
    "preparation_time_min": 15
  }

INDEX: CREATE INDEX ON products USING GIN (specifications)
```

---

## Temporal Queries

### Timestamps Always WITH TIME ZONE

```
WRONG:  created_at TIMESTAMP
CORRECT: created_at TIMESTAMP WITH TIME ZONE

Razón:
  - PostgreSQL storages as UTC
  - Clients interpret as local time
  - Comparisons across timezones work
```

### Querying by Date Range

```
Get orders from yesterday:
  WHERE DATE(created_at) = CURRENT_DATE - 1

Get orders from last 7 days:
  WHERE created_at > NOW() - INTERVAL '7 days'

Index for this:
  CREATE INDEX idx_orders_created_at ON orders (created_at DESC)
```

---

## Statistics & Monitoring

### Query Performance Analysis

```
BEFORE CREATING INDEX:
  EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = $1;
  
AFTER CREATING INDEX:
  CREATE INDEX idx_orders_customer_id ON orders (customer_id);
  EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = $1;
  
Monitor:
  SELECT * FROM pg_stat_user_indexes;
  → Look for idx_scan, idx_tup_read
  → High values = good index
  → Zero values = unused index
```

### Table Size Monitoring

```
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Backup & Recovery

### Backup Strategy

```
Frequency: Every 6 hours
Retention: 30 days (recent), 1 year (archives)
Location: Multi-region S3
Format: PostgreSQL binary dump (pg_dump)

Recovery:
  - Point-in-time recovery (logs replayed)
  - Full restore: <1 hour
  - Partial restore: Specific table/schema
```

### WAL (Write-Ahead Logs)

```
PostgreSQL feature for durability:
  - Logs transactions before applying
  - Enables point-in-time recovery
  - Required for streaming replication
  
Configuration (production):
  - max_wal_size: 16GB (auto-cleanup old)
  - wal_level: replica (for replication)
```

---

## Migration Strategy (Prisma)

### Not in This Document

Schema de Prisma y migraciones se crean DESPUÉS de validar este diseño.

```
Fase:
  1. Validar entidades, relaciones, índices (THIS DOC)
  2. Crear schema.prisma (ETAPA 4)
  3. Generar migraciones: prisma migrate dev
  4. Test en dev environment
  5. Deploy a staging
  6. Deploy a production
```

---

**Próxima parte: Entidades detalladas**
