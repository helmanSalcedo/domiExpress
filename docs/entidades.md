# Entidades de Base de Datos

## 1. CUSTOMERS (Usuarios)

```
customers
├─ id: UUID (PK)
├─ municipality_id: UUID (FK)
├─ phone: VARCHAR(20) UNIQUE (WhatsApp)
├─ email: VARCHAR(255) NULLABLE
├─ name: VARCHAR(255) NOT NULL
├─ preferred_language: VARCHAR(5) DEFAULT 'es'
├─ home_location: POINT NULLABLE
├─ rating: NUMERIC(2,1) DEFAULT 5.0 (1.0-5.0)
├─ total_orders: INTEGER DEFAULT 0 (denormalized, updated on new order)
├─ first_order_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ last_order_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ status: VARCHAR(50) DEFAULT 'ACTIVE' (ACTIVE, SUSPENDED, DELETED)
├─ is_verified: BOOLEAN DEFAULT FALSE
├─ auth_token: VARCHAR(512) NULLABLE (JWT, stored hashed)
├─ auth_token_expires_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ preferred_payment_method: VARCHAR(50) NULLABLE (CARD, BANK_TRANSFER)
├─ created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ created_by: VARCHAR(255) DEFAULT 'system'
├─ updated_by: VARCHAR(255) DEFAULT 'system'
├─ deleted_at: TIMESTAMP WITH TIME ZONE NULLABLE
└─ metadata: JSONB NULLABLE (extra fields)

INDEXES:
  - PRIMARY KEY: id
  - UNIQUE: phone, email
  - SEARCH: municipality_id, status, rating
  - RANGE: created_at

CONSTRAINTS:
  - rating >= 1.0 AND rating <= 5.0
  - status IN ('ACTIVE', 'SUSPENDED', 'DELETED')
  - phone NOT NULL AND phone UNIQUE
  - email IS NULL OR email UNIQUE
```

## 2. MUNICIPALITIES (Municipios)

```
municipalities
├─ id: UUID (PK)
├─ country_code: VARCHAR(2) DEFAULT 'CO' (ISO 3166-1)
├─ name: VARCHAR(255) NOT NULL
├─ department: VARCHAR(255) NOT NULL (Cauca, Antioquia, etc.)
├─ center_location: POINT (lat, lng)
├─ coverage_radius_km: INTEGER DEFAULT 5
├─ max_delivery_distance_km: INTEGER DEFAULT 10
├─ timezone: VARCHAR(50) DEFAULT 'America/Bogota'
├─ language: VARCHAR(5) DEFAULT 'es'
├─ currency: VARCHAR(3) DEFAULT 'COP'
├─ whatsapp_number: VARCHAR(20) NULLABLE
├─ whatsapp_number_id: VARCHAR(255) NULLABLE (Meta's ID)
├─ commission_percentage: NUMERIC(5,2) DEFAULT 10.00
├─ status: VARCHAR(50) DEFAULT 'ACTIVE' (ACTIVE, PAUSED, CLOSED)
├─ is_published: BOOLEAN DEFAULT FALSE
├─ active_commerces: INTEGER DEFAULT 0 (denormalized)
├─ active_drivers: INTEGER DEFAULT 0 (denormalized)
├─ daily_orders: INTEGER DEFAULT 0 (denormalized, today only)
├─ monthly_revenue: DECIMAL(15,2) DEFAULT 0 (denormalized, current month)
├─ created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ launched_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ deleted_at: TIMESTAMP WITH TIME ZONE NULLABLE
└─ metadata: JSONB NULLABLE

INDEXES:
  - PRIMARY KEY: id
  - UNIQUE: whatsapp_number_id
  - SEARCH: status, is_published, country_code

CONSTRAINTS:
  - coverage_radius_km > 0
  - max_delivery_distance_km > coverage_radius_km
  - commission_percentage >= 0 AND <= 100
  - status IN ('ACTIVE', 'PAUSED', 'CLOSED')
```

## 3. COMMERCES (Tiendas/Restaurantes)

```
commerces
├─ id: UUID (PK)
├─ municipality_id: UUID (FK) NOT NULL
├─ api_key: VARCHAR(256) UNIQUE NOT NULL (for API access)
├─ api_key_hash: VARCHAR(256) (bcrypt hash)
├─ whatsapp_number: VARCHAR(20) UNIQUE NOT NULL
├─ whatsapp_number_id: VARCHAR(255) (Meta's ID)
├─ name: VARCHAR(255) NOT NULL
├─ display_name: VARCHAR(255) (for customers, can differ from name)
├─ category: VARCHAR(50) NOT NULL (RESTAURANT, STORE, PHARMACY, etc.)
├─ description: TEXT NULLABLE
├─ location: POINT NOT NULL (exact GPS)
├─ nit: VARCHAR(20) NULLABLE (Colombian tax ID)
├─ owner_name: VARCHAR(255) NOT NULL
├─ owner_phone: VARCHAR(20) NOT NULL
├─ owner_email: VARCHAR(255) NOT NULL
├─ logo_url: VARCHAR(2048) NULLABLE
├─ hero_image_url: VARCHAR(2048) NULLABLE
├─ rating: NUMERIC(2,1) DEFAULT 5.0
├─ total_reviews: INTEGER DEFAULT 0
├─ total_orders: INTEGER DEFAULT 0
├─ total_revenue: DECIMAL(15,2) DEFAULT 0 (all-time)
├─ is_active: BOOLEAN DEFAULT TRUE
├─ is_verified: BOOLEAN DEFAULT FALSE
├─ is_suspended: BOOLEAN DEFAULT FALSE
├─ suspension_reason: TEXT NULLABLE
├─ hours_monday_open: TIME NULLABLE
├─ hours_monday_close: TIME NULLABLE
├─ hours_tuesday_open: TIME NULLABLE
├─ hours_tuesday_close: TIME NULLABLE
... (repeat for each day of week)
├─ hours_sunday_close: TIME NULLABLE
├─ accepts_cash: BOOLEAN DEFAULT TRUE
├─ accepts_card: BOOLEAN DEFAULT TRUE
├─ accepts_bank_transfer: BOOLEAN DEFAULT FALSE
├─ min_order_value: DECIMAL(10,2) DEFAULT 0
├─ delivery_cost: DECIMAL(10,2) DEFAULT 0
├─ estimated_prep_time_minutes: INTEGER DEFAULT 15
├─ created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ verified_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ deleted_at: TIMESTAMP WITH TIME ZONE NULLABLE
└─ metadata: JSONB NULLABLE

INDEXES:
  - PRIMARY KEY: id
  - UNIQUE: api_key, whatsapp_number_id, nit
  - SEARCH: municipality_id, category, is_active, is_verified, rating
  - GEO: location (PostGIS for proximity search)

CONSTRAINTS:
  - rating >= 1.0 AND rating <= 5.0
  - category IN ('RESTAURANT', 'STORE', 'PHARMACY', ...)
  - delivery_cost >= 0
  - min_order_value >= 0
  - estimated_prep_time_minutes > 0
  - opening times are valid (close > open)
```

## 4. PRODUCTS (Productos)

```
products
├─ id: UUID (PK)
├─ commerce_id: UUID (FK) NOT NULL
├─ category_id: UUID (FK) NOT NULL
├─ sku: VARCHAR(100) NULLABLE (stock keeping unit)
├─ name: VARCHAR(255) NOT NULL
├─ description: TEXT NULLABLE
├─ image_url: VARCHAR(2048) NULLABLE
├─ base_price: DECIMAL(10,2) NOT NULL
├─ currency: VARCHAR(3) DEFAULT 'COP'
├─ stock_status: VARCHAR(50) DEFAULT 'IN_STOCK' (IN_STOCK, LIMITED, OUT_OF_STOCK)
├─ is_active: BOOLEAN DEFAULT TRUE
├─ is_featured: BOOLEAN DEFAULT FALSE
├─ preparation_time_minutes: INTEGER DEFAULT 0
├─ serving_size: VARCHAR(100) NULLABLE (e.g., "300g", "2 servings")
├─ ingredients: TEXT NULLABLE (comma-separated or JSON)
├─ allergens: TEXT NULLABLE (GLUTEN, DAIRY, NUTS, etc.)
├─ is_vegan: BOOLEAN DEFAULT FALSE
├─ is_vegetarian: BOOLEAN DEFAULT FALSE
├─ is_spicy: BOOLEAN DEFAULT FALSE
├─ rating: NUMERIC(2,1) DEFAULT 5.0
├─ total_reviews: INTEGER DEFAULT 0
├─ total_sold: INTEGER DEFAULT 0 (denormalized)
├─ embedding: vector(384) NULLABLE (for Claude embeddings search)
├─ created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ deleted_at: TIMESTAMP WITH TIME ZONE NULLABLE
└─ metadata: JSONB NULLABLE

INDEXES:
  - PRIMARY KEY: id
  - UNIQUE: commerce_id, sku
  - SEARCH: commerce_id, category_id, is_active, stock_status
  - AI_SEARCH: embedding (pgvector with cosine distance)
  - TEXT_SEARCH: name, description (full-text)

CONSTRAINTS:
  - base_price > 0
  - stock_status IN ('IN_STOCK', 'LIMITED', 'OUT_OF_STOCK')
  - preparation_time_minutes >= 0
  - rating >= 1.0 AND rating <= 5.0
```

## 5. ORDERS (Pedidos)

```
orders
├─ id: UUID (PK)
├─ reference: VARCHAR(100) UNIQUE (ORD-2024-00234 for humans)
├─ municipality_id: UUID (FK) NOT NULL
├─ customer_id: UUID (FK) NOT NULL
├─ payment_id: UUID (FK) NULLABLE
├─ delivery_id: UUID (FK) NULLABLE
├─ status: VARCHAR(50) DEFAULT 'PENDING' (15+ states)
├─ order_type: VARCHAR(50) DEFAULT 'DELIVERY' (DELIVERY, PICKUP)
├─ customer_location: POINT NOT NULL (delivery location)
├─ customer_address_text: VARCHAR(500) NULLABLE
├─ customer_phone: VARCHAR(20) NOT NULL
├─ customer_notes: TEXT NULLABLE (special requests)
├─ subtotal: DECIMAL(12,2) NOT NULL
├─ delivery_fee: DECIMAL(10,2) DEFAULT 0
├─ discount_amount: DECIMAL(10,2) DEFAULT 0 (if applicable)
├─ tax_amount: DECIMAL(10,2) DEFAULT 0
├─ total_amount: DECIMAL(12,2) NOT NULL
├─ currency: VARCHAR(3) DEFAULT 'COP'
├─ estimated_delivery_minutes: INTEGER NULLABLE
├─ actual_delivery_minutes: INTEGER NULLABLE (calculated after completed)
├─ created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ confirmed_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ completed_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ cancelled_at: TIMESTAMP WITH TIME ZONE NULLABLE
└─ metadata: JSONB NULLABLE

INDEXES:
  - PRIMARY KEY: id
  - UNIQUE: reference
  - SEARCH: customer_id, municipality_id, status, created_at
  - RANGE: created_at DESC (for recent orders)
  - GEO: customer_location (for nearby order queries)

CONSTRAINTS:
  - total_amount > 0
  - subtotal >= 0
  - delivery_fee >= 0
  - status IN ('PENDING', 'CONFIRMED', ..., 'COMPLETED')
  - actual_delivery_minutes IS NULL OR actual_delivery_minutes > 0
```

## 6. ORDER_ITEMS (Items en Pedido)

```
order_items
├─ id: UUID (PK)
├─ order_id: UUID (FK) NOT NULL
├─ commerce_id: UUID (FK) NOT NULL
├─ product_id: UUID (FK) NOT NULL
├─ quantity: INTEGER NOT NULL (>= 1)
├─ unit_price: DECIMAL(10,2) NOT NULL (snapshot at order time)
├─ customization_text: TEXT NULLABLE (special instructions)
├─ customization_extra_cost: DECIMAL(10,2) DEFAULT 0
├─ subtotal: DECIMAL(12,2) NOT NULL (quantity × unit_price)
├─ status: VARCHAR(50) DEFAULT 'PENDING' (PENDING, PREPARING, READY, etc.)
├─ created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
└─ updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

INDEXES:
  - PRIMARY KEY: id
  - FK: order_id, commerce_id, product_id
  - SEARCH: order_id, commerce_id, status

CONSTRAINTS:
  - quantity > 0
  - unit_price > 0
  - subtotal = quantity × unit_price
  - customization_extra_cost >= 0
```

## 7. DRIVERS (Domiciliarios)

```
drivers
├─ id: UUID (PK)
├─ municipality_id: UUID (FK) NOT NULL
├─ full_name: VARCHAR(255) NOT NULL
├─ phone: VARCHAR(20) NOT NULL UNIQUE
├─ identification_number: VARCHAR(50) UNIQUE NOT NULL
├─ identification_type: VARCHAR(50) (CC, CE, PASAPORTE)
├─ date_of_birth: DATE NULLABLE
├─ vehicle_type: VARCHAR(50) NOT NULL (BIKE, MOTORCYCLE, CAR)
├─ vehicle_license_plate: VARCHAR(20) NULLABLE UNIQUE
├─ vehicle_brand: VARCHAR(100) NULLABLE
├─ vehicle_color: VARCHAR(50) NULLABLE
├─ insurance_policy_number: VARCHAR(100) NULLABLE
├─ insurance_expiry_date: DATE NULLABLE
├─ bank_account_number: VARCHAR(50) NULLABLE
├─ bank_account_holder: VARCHAR(255) NULLABLE
├─ rating: NUMERIC(2,1) DEFAULT 5.0
├─ total_deliveries: INTEGER DEFAULT 0
├─ is_active: BOOLEAN DEFAULT TRUE
├─ is_verified: BOOLEAN DEFAULT FALSE
├─ is_suspended: BOOLEAN DEFAULT FALSE
├─ suspension_reason: TEXT NULLABLE
├─ current_location: POINT NULLABLE (NOT STORED, use Redis)
├─ last_location_update: TIMESTAMP WITH TIME ZONE NULLABLE
├─ total_earnings: DECIMAL(15,2) DEFAULT 0 (denormalized)
├─ monthly_earnings: DECIMAL(15,2) DEFAULT 0 (current month, denormalized)
├─ created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ verified_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ deleted_at: TIMESTAMP WITH TIME ZONE NULLABLE
└─ metadata: JSONB NULLABLE

INDEXES:
  - PRIMARY KEY: id
  - UNIQUE: phone, identification_number, vehicle_license_plate
  - SEARCH: municipality_id, is_active, is_verified, rating

CONSTRAINTS:
  - rating >= 1.0 AND rating <= 5.0
  - vehicle_type IN ('BIKE', 'MOTORCYCLE', 'CAR')
  - identification_type IN ('CC', 'CE', 'PASAPORTE')
  - insurance_expiry_date IS NULL OR insurance_expiry_date >= TODAY
```

## 8. DELIVERIES (Entregas)

```
deliveries
├─ id: UUID (PK)
├─ order_id: UUID (FK) NOT NULL UNIQUE
├─ driver_id: UUID (FK) NOT NULL
├─ status: VARCHAR(50) DEFAULT 'PENDING' (ASSIGNED, PICKING, DELIVERING, COMPLETED)
├─ pickup_location: POINT NOT NULL (commerce location)
├─ delivery_location: POINT NOT NULL (customer location)
├─ distance_km: DECIMAL(10,2) NOT NULL
├─ estimated_duration_minutes: INTEGER NOT NULL
├─ actual_duration_minutes: INTEGER NULLABLE
├─ started_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ completed_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ delivery_proof_photo_url: VARCHAR(2048) NULLABLE
├─ delivery_confirmation_pin: VARCHAR(10) NULLABLE (hashed)
├─ delivery_confirmation_timestamp: TIMESTAMP WITH TIME ZONE NULLABLE
├─ created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
└─ metadata: JSONB NULLABLE

INDEXES:
  - PRIMARY KEY: id
  - UNIQUE: order_id
  - FK: order_id, driver_id
  - SEARCH: driver_id, status, created_at

CONSTRAINTS:
  - distance_km > 0
  - estimated_duration_minutes > 0
  - actual_duration_minutes IS NULL OR actual_duration_minutes > 0
  - status IN ('ASSIGNED', 'PICKING', 'DELIVERING', 'COMPLETED')
```

## 9. PAYMENTS (Pagos)

```
payments
├─ id: UUID (PK)
├─ order_id: UUID (FK) NOT NULL
├─ wompi_transaction_id: VARCHAR(255) UNIQUE NULLABLE
├─ wompi_reference: VARCHAR(255) UNIQUE NOT NULL
├─ amount_in_cents: BIGINT NOT NULL (in COP cents, e.g., 6800000)
├─ currency: VARCHAR(3) DEFAULT 'COP'
├─ status: VARCHAR(50) DEFAULT 'PENDING' (PENDING, APPROVED, DECLINED, REFUNDED)
├─ payment_method: VARCHAR(50) (CARD, BANK_TRANSFER, CASH)
├─ customer_email: VARCHAR(255) NULLABLE
├─ card_last_four: VARCHAR(4) NULLABLE (last 4 digits only)
├─ card_brand: VARCHAR(50) NULLABLE (VISA, MASTERCARD)
├─ fraud_score: NUMERIC(3,1) NULLABLE (0.0-10.0)
├─ fraud_status: VARCHAR(50) NULLABLE (APPROVED, SUSPICIOUS, BLOCKED)
├─ created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ approved_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ declined_at: TIMESTAMP WITH TIME ZONE NULLABLE
├─ webhook_received_at: TIMESTAMP WITH TIME ZONE NULLABLE (when Wompi webhook arrived)
└─ metadata: JSONB NULLABLE

INDEXES:
  - PRIMARY KEY: id
  - UNIQUE: wompi_reference, wompi_transaction_id
  - FK: order_id
  - SEARCH: status, payment_method, created_at

CONSTRAINTS:
  - amount_in_cents > 0
  - status IN ('PENDING', 'APPROVED', 'DECLINED', 'REFUNDED')
  - fraud_score IS NULL OR (fraud_score >= 0 AND fraud_score <= 10)
```

## 10. DRIVER_EARNINGS (Ganancias Domiciliarios)

```
driver_earnings
├─ id: UUID (PK)
├─ driver_id: UUID (FK) NOT NULL
├─ delivery_id: UUID (FK) NOT NULL
├─ base_fee: DECIMAL(10,2) NOT NULL (e.g., $3,500)
├─ bonus_fee: DECIMAL(10,2) DEFAULT 0 (for time efficiency)
├─ penalty_fee: DECIMAL(10,2) DEFAULT 0 (for late delivery)
├─ total_amount: DECIMAL(10,2) NOT NULL (base + bonus - penalty)
├─ status: VARCHAR(50) DEFAULT 'COMPLETED' (PENDING, COMPLETED, PAID)
├─ created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
├─ paid_at: TIMESTAMP WITH TIME ZONE NULLABLE
└─ liquidity_batch_id: UUID NULLABLE (for bulk payment processing)

INDEXES:
  - PRIMARY KEY: id
  - FK: driver_id, delivery_id
  - SEARCH: driver_id, status, created_at

CONSTRAINTS:
  - total_amount = base_fee + bonus_fee - penalty_fee
  - status IN ('PENDING', 'COMPLETED', 'PAID')
```

---

**Próxima parte: Relaciones, índices, enumeraciones**
