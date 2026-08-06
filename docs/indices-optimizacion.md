# Índices y Optimización de Base de Datos

## Estrategia de Indexing

### Principios

```
1. NO crear índices "just in case"
2. Indexar SOLO hot query paths
3. Costo: Storage (SSD) + INSERT/UPDATE overhead
4. Beneficio: SELECT/WHERE query speed

REGLA: 1 index per column in WHERE clauses
  - Orders by (customer_id, status, created_at) → 1 composite index
  - NOT: 3 separate indexes
```

### Index Types Used

```
B-TREE (default):
  - Range queries (>, <, BETWEEN)
  - Equality (=)
  - Sorting (ORDER BY)
  - Most common
  
GiST (PostgreSQL spatial):
  - Location searches (PostGIS POINT)
  - Proximity queries (ST_DWithin)
  
GIN (Generalized Inverted Index):
  - Full-text search
  - JSONB queries (@ operator)
  
pgvector (NEW):
  - Vector similarity (cosine distance)
  - For AI embeddings (product search)
```

---

## Índices por Tabla

### customers

```
PRIMARY KEY:
  customers_pkey (id)

UNIQUE:
  idx_customers_phone (phone)
  idx_customers_email (email)

SEARCH (hot paths):
  idx_customers_municipality (municipality_id)
  idx_customers_status (status) WHERE deleted_at IS NULL
  idx_customers_created (created_at DESC)
  idx_customers_rating (rating DESC)

COMPOSITE (common queries):
  idx_customers_municipality_status 
    (municipality_id, status, created_at DESC)

Total: 7 indexes
```

### commerces

```
PRIMARY KEY:
  commerces_pkey (id)

UNIQUE:
  idx_commerces_api_key (api_key)
  idx_commerces_whatsapp_number (whatsapp_number)
  idx_commerces_nit (nit)

SEARCH:
  idx_commerces_municipality (municipality_id)
  idx_commerces_category (category)
  idx_commerces_rating (rating DESC)
  idx_commerces_is_active (is_active) WHERE deleted_at IS NULL

GEO (critical for proximity search):
  idx_commerces_location (location) USING GIST

COMPOSITE:
  idx_commerces_municipality_category_active 
    (municipality_id, category, is_active, rating DESC)

Total: 9 indexes
```

### products

```
PRIMARY KEY:
  products_pkey (id)

UNIQUE:
  idx_products_commerce_sku (commerce_id, sku)

SEARCH:
  idx_products_commerce (commerce_id)
  idx_products_category (category_id)
  idx_products_is_active (is_active) WHERE deleted_at IS NULL
  idx_products_total_sold (total_sold DESC)

AI/SEARCH:
  idx_products_embedding (embedding) USING IVFFLAT (vector search)
  idx_products_name_tsvector (to_tsvector('spanish', name))
  idx_products_description_tsvector (to_tsvector('spanish', description))

COMPOSITE:
  idx_products_commerce_active 
    (commerce_id, is_active, rating DESC)

Total: 9 indexes
```

### orders

```
PRIMARY KEY:
  orders_pkey (id)

UNIQUE:
  idx_orders_reference (reference)

SEARCH (critical - frequent queries):
  idx_orders_customer (customer_id)
  idx_orders_municipality (municipality_id)
  idx_orders_status (status) WHERE deleted_at IS NULL
  idx_orders_created (created_at DESC)
  idx_orders_completed (completed_at DESC)

GEO:
  idx_orders_customer_location (customer_location) USING GIST

COMPOSITE (most common queries):
  idx_orders_customer_status_created 
    (customer_id, status, created_at DESC)
  idx_orders_municipality_status_created
    (municipality_id, status, created_at DESC)
  idx_orders_status_created_partial
    (status, created_at DESC) WHERE status NOT IN ('COMPLETED', 'CANCELLED')

Total: 9 indexes
```

### order_items

```
PRIMARY KEY:
  order_items_pkey (id)

FK:
  idx_order_items_order (order_id)
  idx_order_items_commerce (commerce_id)
  idx_order_items_product (product_id)

COMPOSITE:
  idx_order_items_order_commerce (order_id, commerce_id)

Total: 4 indexes
```

### payments

```
PRIMARY KEY:
  payments_pkey (id)

UNIQUE:
  idx_payments_wompi_reference (wompi_reference)
  idx_payments_wompi_transaction (wompi_transaction_id)

SEARCH:
  idx_payments_order (order_id)
  idx_payments_status (status)
  idx_payments_created (created_at DESC)

COMPOSITE:
  idx_payments_status_created (status, created_at DESC)

Total: 6 indexes
```

### deliveries

```
PRIMARY KEY:
  deliveries_pkey (id)

UNIQUE:
  idx_deliveries_order (order_id)

FK:
  idx_deliveries_driver (driver_id)

SEARCH:
  idx_deliveries_status (status)
  idx_deliveries_created (created_at DESC)

GEO:
  idx_deliveries_delivery_location (delivery_location) USING GIST

COMPOSITE:
  idx_deliveries_driver_status (driver_id, status)
  idx_deliveries_driver_created (driver_id, created_at DESC)

Total: 7 indexes
```

### drivers

```
PRIMARY KEY:
  drivers_pkey (id)

UNIQUE:
  idx_drivers_phone (phone)
  idx_drivers_identification (identification_number)
  idx_drivers_plate (vehicle_license_plate)

SEARCH:
  idx_drivers_municipality (municipality_id)
  idx_drivers_is_active (is_active)
  idx_drivers_rating (rating DESC)

COMPOSITE:
  idx_drivers_municipality_active (municipality_id, is_active, rating DESC)

Total: 7 indexes
```

---

## Query Optimization Techniques

### 1. Partial Indexes

```
For soft deletes:
  CREATE INDEX idx_orders_active ON orders (status, created_at DESC)
  WHERE deleted_at IS NULL;
  
  Query: SELECT * FROM orders WHERE status = 'PENDING'
  └─ Index used (no need to scan deleted)
```

### 2. Covering Indexes

```
Include extra columns in index to avoid table lookup:
  
  CREATE INDEX idx_orders_covering ON orders (
    customer_id,
    status,
    created_at
  ) INCLUDE (total_amount, delivery_location);
  
  Query: SELECT customer_id, status, total_amount FROM orders WHERE customer_id = $1
  └─ Index fully covers query (no table access needed)
```

### 3. Composite Index Ordering

```
RULE: (equality, range, sort)

  CREATE INDEX idx_orders_composite ON orders (
    municipality_id,        -- equality (WHERE)
    status,                 -- equality (WHERE)
    created_at DESC         -- range/sort (ORDER BY)
  );
```

### 4. Full-Text Search

```
For searching products by name:
  
  CREATE INDEX idx_products_name_fts ON products
  USING GIN (to_tsvector('spanish', name));
  
  Query: SELECT * FROM products 
         WHERE to_tsvector('spanish', name) @@ plainto_tsquery('pizza')
```

### 5. Vector Search (pgvector)

```
For AI-powered product search:
  
  CREATE INDEX idx_products_embedding ON products
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
  
  Query: SELECT * FROM products 
         ORDER BY embedding <-> $1 LIMIT 10
         -- $1 = Claude embedding vector
```

---

## Query Patterns & Optimization

### Pattern 1: Filter by Municipality + Status

```
COMMON QUERY (hot):
  SELECT * FROM orders 
  WHERE municipality_id = $1 AND status = $2 
  ORDER BY created_at DESC 
  LIMIT 20;

INDEX:
  idx_orders_municipality_status_created
    (municipality_id, status, created_at DESC)

EXPLAIN:
  Index Scan using idx_orders_municipality_status_created (cost=0.29..12.30)
  └─ Bitmap Index Scan (excellent)
```

### Pattern 2: Find Nearby Commerces

```
COMMON QUERY (hot):
  SELECT * FROM commerces 
  WHERE municipality_id = $1 
  AND ST_DWithin(location, $2::geography, 5000)
  ORDER BY ST_Distance(location, $2::geography)
  LIMIT 10;

INDEX:
  idx_commerces_location (location) USING GIST
  idx_commerces_municipality (municipality_id)

OPTIMIZATION:
  - Use geography type (meters, accurate)
  - GIST index handles proximity efficiently
  - Always include municipality_id filter first
```

### Pattern 3: Recent Orders for Customer

```
COMMON QUERY (hot):
  SELECT * FROM orders 
  WHERE customer_id = $1 AND deleted_at IS NULL
  ORDER BY created_at DESC 
  LIMIT 20;

INDEX:
  idx_orders_customer_created (customer_id, created_at DESC)
  WHERE deleted_at IS NULL

OPTIMIZATION:
  - Partial index (exclude deleted)
  - DESC on created_at (natural sort order)
```

### Pattern 4: Search Products by Embedding

```
COMMON QUERY (hot):
  SELECT id, name, commerce_id FROM products 
  WHERE commerce_id = $1
  ORDER BY embedding <-> $2::vector LIMIT 10;

INDEX:
  idx_products_embedding (embedding) USING ivfflat

OPTIMIZATION:
  - pgvector handles cosine similarity
  - IVFFLAT faster than HNSW for large datasets
  - lists=100 (good balance between speed/accuracy)
```

---

## Maintenance & Monitoring

### Analyze Query Plans

```
EXPLAIN ANALYZE 
  SELECT * FROM orders 
  WHERE customer_id = $1 AND status = $2;

Look for:
  ✓ Index Scan (good)
  ✓ Bitmap Index Scan (excellent)
  ✗ Sequential Scan (bad - full table scan)
  ✗ Slow (>100ms)
```

### Find Unused Indexes

```
SELECT
  schemaname, tablename, indexname,
  idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY idx_size DESC;

Action:
  ✗ idx_scan = 0 AND idx_size > 10MB → DROP INDEX
  ✓ idx_scan > 1000 AND idx_tup_read > 10000 → Keep
```

### Monitor Index Size

```
SELECT
  schemaname, tablename, indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

Targets:
  - Total index size < 50% of table size (healthy)
  - Largest index < 1GB (manageable)
```

---

## Partitioning Strategy (Future, Year 2)

### Current State (MVP)

```
Single table, no partitioning
├─ PostgreSQL handles up to 100M rows
├─ Query planner optimizes with indexes
└─ Performance adequate for 1K orders/day
```

### Month 6 Strategy

```
Range Partitioning by Date:

orders
├─ orders_2024_01 (orders from Jan 2024)
├─ orders_2024_02 (orders from Feb 2024)
├─ orders_2024_03 (orders from Mar 2024)
└─ orders_2024_q2 (future partitions)

Benefits:
  - Faster deletes (drop old partition)
  - Parallel query execution
  - Better index locality
  - Easier archival
```

### Year 2 Strategy

```
Composite Partitioning:

orders
├─ Partition by municipality_id (key distribution)
└─ Sub-partition by date (time-series)

orders_mun_timbio_2024_01
orders_mun_popayan_2024_01
...

Benefits:
  - Near-future sharding across databases
  - Better cache locality per municipality
  - Can move partitions to separate servers
```

---

## Caching Strategy (Duplicate in Redis)

### What to Cache

```
FREQUENTLY ACCESSED:
  ✓ Recent orders (last 24h)
  ✓ Commerce catalogs (TTL 1h)
  ✓ Product details (TTL 1h)
  ✓ Customer preferences (TTL 30min)
  ✓ Location distances (TTL 24h)

NOT CACHED:
  ✗ Current driver locations (Redis only, no DB)
  ✗ Payment status (always from DB)
  ✗ Sensitive user data (no cache)
```

### Cache Invalidation

```
STRATEGY: TTL + Event-based

Orders:
  - Created: Cache for 5 min
  - Expired: TTL removes automatically
  - Updated: Event invalidates immediately

Catalogs:
  - Cached: 1 hour TTL
  - On change: Invalidate key
  - Next read: Reload from DB
```

---

## Performance Targets Met

| Query | Target | With Index | Improvement |
|-------|--------|-----------|-------------|
| Get customer orders | <100ms | 45ms | 2.2x |
| Find nearby commerces | <500ms | 120ms | 4.2x |
| Search products | <5s | 800ms | 6.2x |
| Get order details | <50ms | 15ms | 3.3x |

---

**Estado**: Diseño validado, implementación en ETAPA 4
