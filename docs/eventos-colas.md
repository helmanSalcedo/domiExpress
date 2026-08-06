# Eventos y Colas de Procesamiento

## Arquitectura Event-Driven

DomiExpress utiliza **eventos de dominio** para desacoplar componentes y permitir procesamiento asincrónico.

```
┌─────────────────┐
│   Use Case      │  Realiza acción
│   Service       │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │ Event   │  Emite evento de dominio
    └────┬────┘
         │
    ┌────▼─────────────────────┐
    │ Event Emitter (In-Memory)│
    └────┬─────────────────────┘
         │
    ┌────▼──────────────┐
    │ Event Listeners   │  Múltiples listeners pueden reaccionar
    │ (Pub/Sub)         │
    └────┬──────────────┘
         │
    ┌────▼──────────────────────┐
    │ Add to Job Queue (Redis)   │
    │ (BullMQ)                   │
    └────┬──────────────────────┘
         │
    ┌────▼──────────────┐
    │ BullMQ Workers    │  Procesan jobs asincronicamente
    │ (background tasks)│
    └───────────────────┘
```

---

## Eventos de Dominio

### 1. Order Events

```
OrderCreated
  Trigger: Customer paga pedido
  Payload: {
    orderId, customerId, commerceIds[],
    totalAmount, location, timestamp
  }
  Listeners:
    - NotifyCommerceService → Enviar notificación WhatsApp
    - AnalyticsService → Registrar métrica
    - OrderStateService → Cambiar estado

OrderAccepted
  Trigger: Comercio acepta pedido
  Payload: { orderId, commerceId }
  Listeners:
    - NotifyDriverService → Ofrecer entrega
    - AnalyticsService → Registrar métrica

OrderRejected
  Trigger: Comercio rechaza pedido
  Payload: { orderId, commerceId, reason }
  Listeners:
    - NotifyCustomerService → Ofrecer alternativas
    - RecommendationService → Sugerir otro comercio

OrderReady
  Trigger: Comercio marca como listo
  Payload: { orderId, commerceId, estimatedDeliveryTime }
  Listeners:
    - DriverAssignmentService → Asignar domiciliario
    - NotifyCustomerService → Actualizar ETA

OrderAssigned
  Trigger: Domiciliario acepta entrega
  Payload: { orderId, driverId, driverName, driverPhone }
  Listeners:
    - NotifyCustomerService → Enviar datos del domiciliario
    - TrackingService → Iniciar GPS tracking
    - AnalyticsService → Registrar métrica

OrderInDelivery
  Trigger: Domiciliario recogió todos los productos
  Payload: { orderId, driverId, location }
  Listeners:
    - NotifyCustomerService → Notificar que está en camino
    - TrackingService → Actualizar ubicación en tiempo real
    - ETAService → Calcular tiempo de llegada

OrderDelivered
  Trigger: Cliente confirma entrega con PIN
  Payload: { orderId, driverId, photo, timestamp }
  Listeners:
    - PaymentService → Liberar dinero de escrow
    - AnalyticsService → Registrar métrica completa
    - RatingService → Pedir calificación

OrderCompleted
  Trigger: Cliente calificó experiencia
  Payload: { orderId, customerRating, driverRating, commerceRating }
  Listeners:
    - ReputationService → Actualizar ratings
    - RecommendationService → Entrenar modelo
    - AnalyticsService → Finalizar análisis

OrderCancelled
  Trigger: Cliente o comercio cancela
  Payload: { orderId, cancelledBy, reason }
  Listeners:
    - PaymentService → Procesar reembolso
    - NotifyService → Notificar todas las partes
    - AnalyticsService → Registrar cancelación
```

### 2. Payment Events

```
PaymentInitiated
  Trigger: Cliente toca "Pagar"
  Payload: { orderId, amount, currency }
  Listeners:
    - FraudDetectionService → Validar transacción

PaymentCompleted
  Trigger: Wompi confirma pago (webhook)
  Payload: { orderId, reference, amount, timestamp }
  Listeners:
    - OrderService → Cambiar a PAYMENT_OK
    - NotifyCommerceService → Enviar pedido
    - AnalyticsService → Registrar ingresos

PaymentFailed
  Trigger: Wompi rechaza pago
  Payload: { orderId, reason, retryable }
  Listeners:
    - NotifyCustomerService → Pedir reintentar
    - AnalyticsService → Registrar fallo

PaymentRefunded
  Trigger: Admin o sistema procesa reembolso
  Payload: { orderId, amount, reason }
  Listeners:
    - WompiService → Procesar reembolso
    - NotifyCustomerService → Confirmar reembolso
    - AnalyticsService → Registrar reembolso
```

### 3. Delivery Events

```
DriverAssignmentRequested
  Trigger: Pedido está listo, necesita domiciliario
  Payload: { orderId, pickupLocation, deliveryLocation }
  Listeners:
    - DriverMatchingService → Buscar domiciliario disponible

DriverAssignmentCompleted
  Trigger: Domiciliario aceptó entrega
  Payload: { orderId, driverId }
  Listeners:
    - NotifyCustomerService → Enviar datos domiciliario
    - TrackingService → Iniciar tracking

DeliveryPickupStarted
  Trigger: Domiciliario está en camino al comercio
  Payload: { orderId, driverId, location }
  Listeners:
    - TrackingService → Actualizar ubicación

DeliveryPickupCompleted
  Trigger: Domiciliario recogió pedido en comercio
  Payload: { orderId, driverId, photo, timestamp }
  Listeners:
    - NotifyCustomerService → "Domiciliario en camino"
    - TrackingService → Cambiar destino

DeliveryCompleted
  Trigger: Cliente confirma con PIN
  Payload: { orderId, driverId, photo }
  Listeners:
    - PaymentService → Transferir dinero
    - DriverEarningsService → Acreditar comisión
    - AnalyticsService → Registrar entrega
```

### 4. Driver Events

```
DriverShiftStarted
  Trigger: Domiciliario activa turno
  Payload: { driverId, location, vehicleType, shiftType }
  Listeners:
    - DriverAvailabilityService → Marcar disponible
    - TrackingService → Iniciar GPS tracking
    - AnalyticsService → Registrar turno

DriverShiftEnded
  Trigger: Domiciliario desactiva turno
  Payload: { driverId, location, shiftDuration }
  Listeners:
    - DriverAvailabilityService → Marcar no disponible
    - TrackingService → Detener GPS tracking
    - EarningsService → Calcular ganancias del turno

DriverLocationUpdated
  Trigger: Cada 15 segundos durante entrega
  Payload: { driverId, orderId, location, timestamp }
  Listeners:
    - TrackingService → Actualizar en Redis
    - NotifyCustomerService → Broadcast ubicación (cada 3 min)
    - ETAService → Recalcular ETA
```

### 5. Commerce Events

```
CommerceRegistered
  Trigger: Nuevo comercio se registra
  Payload: { commerceId, name, category, location }
  Listeners:
    - CatalogService → Crear catálogo vacío
    - AnalyticsService → Registrar nuevo comercio

CatalogUpdated
  Trigger: Comercio actualiza productos/precios
  Payload: { commerceId, products[], changes }
  Listeners:
    - SearchIndexService → Actualizar índices
    - AnalyticsService → Registrar cambio

CommerceRatingUpdated
  Trigger: Cliente califica comercio
  Payload: { commerceId, rating, review }
  Listeners:
    - ReputationService → Actualizar rating
    - RecommendationService → Reentrenar modelo

CommerceSuspended
  Trigger: Admin suspende comercio
  Payload: { commerceId, reason }
  Listeners:
    - NotifyCommerceService → Notificar suspensión
    - AnalyticsService → Registrar evento
```

---

## Colas de Procesamiento (BullMQ)

### Arquitectura de Colas

```
┌──────────────────────────────────┐
│  Redis (job storage + state)     │
└────────┬─────────────────────────┘
         │
    ┌────┴───────────────────┐
    │                        │
┌───▼────────────┐  ┌───────▼──────────┐
│   Queue 1      │  │   Queue 2        │
│ (fast jobs)    │  │ (slow jobs)      │
│                │  │                  │
└────┬───────────┘  └───────┬──────────┘
     │                      │
┌────▼──────────────────────▼────────┐
│  BullMQ Workers (concurrency limit)│
│  ┌─────────────┐                   │
│  │  Worker 1   │                   │
│  ├─ Process    │                   │
│  ├─ Retry      │                   │
│  └─ Complete   │                   │
└───────────────────────────────────┘
     │
┌────▼──────────────────────────────┐
│  Dead Letter Queue (for failures)  │
│  - Automatic replay after 24h      │
│  - Manual replay option for admins │
└───────────────────────────────────┘
```

### 12 Colas Principales

| Queue | Prioridad | Timeout | Retries | Descripción |
|-------|-----------|---------|---------|------------|
| **notifications** | HIGH | 30s | 3 | Enviar WhatsApp |
| **payments** | CRITICAL | 60s | 5 | Procesar pagos |
| **deliveries** | HIGH | 120s | 2 | Asignar domiciliarios |
| **emails** | LOW | 30s | 3 | Enviar emails |
| **analytics** | LOW | 60s | 1 | Registrar eventos |
| **ai-search** | MEDIUM | 5s | 2 | Procesar búsqueda IA |
| **ocr** | MEDIUM | 30s | 1 | Procesar OCR de menús |
| **fraud-detection** | CRITICAL | 10s | 3 | Detectar fraude |
| **location-update** | HIGH | 5s | 1 | Actualizar ubicación GPS |
| **invoice** | MEDIUM | 60s | 2 | Generar facturas |
| **reporting** | LOW | 300s | 1 | Generar reportes |
| **cleanup** | LOW | 300s | 1 | Limpieza de datos (cron) |

### Definición de Colas

#### Queue: notifications

```
Job Type: SendWhatsAppMessage
Payload: {
  recipient: string (teléfono)
  template: string (mensaje_id)
  variables: object
  priority: 'high' | 'normal'
}
Handler: NotificationWorker
├─ Llamar WhatsApp API
├─ Reintentar si falla
├─ Registrar en auditoría
└─ Actualizar estado de mensaje

Concurrency: 10 (no sobrecargar WhatsApp)
Max attempts: 3
Backoff: exponential (1s, 2s, 4s)
Dead letter: Si falla después de retries
```

#### Queue: payments

```
Job Type: ProcessPayment
Payload: {
  orderId: string
  amount: number
  wompiReference: string
  customerId: string
}
Handler: PaymentWorker
├─ Validar pago con Wompi
├─ Liberar dinero de escrow
├─ Transferir a comercio
├─ Acreditar domiciliario
├─ Actualizar orden
└─ Emitir evento PaymentCompleted

Concurrency: 5 (crítico)
Max attempts: 5
Backoff: exponential + jitter
Dead letter: Jobs críticos
```

#### Queue: deliveries

```
Job Type: AssignDriver
Payload: {
  orderId: string
  pickupLocation: {lat, lng}
  deliveryLocation: {lat, lng}
  estimatedDistance: number
}
Handler: DeliveryWorker
├─ Buscar domiciliarios disponibles
├─ Calcular distancia
├─ Enviar notificación a domiciliario
├─ Esperar aceptación (30s timeout)
├─ Si no acepta: reintentar siguiente driver
└─ Si acepta: Actualizar orden + notificar cliente

Concurrency: 20
Max attempts: 2 (solo reintenta una vez)
Backoff: linear 5s
Dead letter: Si no hay domiciliarios
```

#### Queue: ai-search

```
Job Type: ProcessSearchQuery
Payload: {
  customerId: string
  query: string
  municipalityId: string
}
Handler: SearchWorker
├─ Llamar Claude API para NLU
├─ Extraer entidades
├─ Buscar en BD (embeddings)
├─ Rankear resultados
└─ Guardar en caché (Redis, 1h)

Concurrency: 15
Max attempts: 2
Backoff: linear 2s
Timeout: 5s (IA debe ser rápida)
```

#### Queue: fraud-detection

```
Job Type: AnalyzeFraud
Payload: {
  orderId: string
  customerId: string
  paymentData: object
  ipAddress: string
  deviceId: string
}
Handler: FraudWorker
├─ Calcular risk score
├─ Comparar con histórico
├─ Evaluar patrones
├─ Tomar decisión: Allow/Block/2FA
└─ Actualizar BD con resultado

Concurrency: 20
Max attempts: 1
Timeout: 10s
```

---

## Procesamiento de Eventos

```
Domain Event Emitted
    ↓
NestJS EventEmitter (in-memory)
    ↓
Event Listeners (multiple subscribers)
    ├─ Listener 1: Add job to Queue A
    ├─ Listener 2: Add job to Queue B
    └─ Listener 3: Update Cache
    ↓
BullMQ Queue (Redis)
    ├─ Job 1 (notifications)
    ├─ Job 2 (payments)
    └─ Job 3 (analytics)
    ↓
BullMQ Workers (process in parallel)
    ├─ Worker 1: Sends WhatsApp
    ├─ Worker 2: Processes payment
    └─ Worker 3: Updates analytics
    ↓
Side Effects Complete
    ├─ WhatsApp message sent
    ├─ Payment transferred
    └─ Analytics updated
```

---

## Garantías de Entrega

### At-Least-Once Delivery

```
✓ Job added to Redis queue
✓ Job assigned to worker
✓ Worker processes job
  ├─ If success: Remove from queue
  ├─ If failure: Retry (exponential backoff)
  └─ If persistent failure: Move to dead letter queue

Garantía: Job SIEMPRE se procesa (puede ser múltiples veces)
Solución: Hacer jobs idempotent (safe to retry)
```

### Idempotency

```
Cada job tiene UNIQUE KEY basado en:
  - orderId + "payment" → "order-123-payment"
  - customerId + timestamp → "customer-456-timestamp-2024-01-15"

Si job se reintenta con misma key:
  ├─ Verificar: ¿Ya fue procesado?
  ├─ Si sí: Retornar resultado anterior
  └─ Si no: Procesar normalmente

Redis SETNX (atomic set if not exists) para garantizar unicidad
```

---

## Monitoring de Colas

### Métricas Capturadas

```
Por Queue:
  - Total jobs enqueued
  - Jobs completados
  - Jobs fallidos
  - Jobs retried
  - Tiempo promedio de procesamiento
  - Tamaño actual de la cola

Alerts:
  - Cola >1000 jobs (está atrasada)
  - Tasa de error >5%
  - Tiempo de procesamiento >threshold
  - Dead letter queue >100 jobs
```

### Dashboard

```
BullBoard (UI oficial de BullMQ)
  ├─ Visualizar todas las colas
  ├─ Ver jobs actuales
  ├─ Ver historial
  ├─ Retry jobs manuales
  └─ Pausar/Reanudar colas

Acceso: Solo admins
URL: admin.domiexpress.app/bullboard
```

---

## Recuperación de Fallos

### Dead Letter Queue (DLQ)

```
Cuando job falla después de N retries:
  ├─ Mover a DLQ
  ├─ Guardar error/stack trace
  ├─ Notificar admin
  └─ Esperar acción manual

Admin options:
  ├─ Re-queue (reintentar)
  ├─ Inspect (ver detalles)
  ├─ Delete (descartar)
  └─ Escalate (contactar dev)
```

### Automatic Cleanup

```
Cron Job (cada 24 horas):
  ├─ Buscar jobs en DLQ >24 horas
  ├─ Reintentar automáticamente
  ├─ Si todavía falla: Alert admin
  └─ Si pasa 7 días: Delete
```

---

## Escalabilidad de Colas

```
CARGA BAJA (0-100 pedidos/día):
  - 1 servidor NestJS
  - 1 Redis instance
  - 1 BullMQ worker (concurrency 10)

CARGA MEDIA (100-1,000 pedidos/día):
  - 2-3 servidores NestJS
  - 1 Redis instance (con réplica)
  - 2-3 BullMQ workers (concurrency 5 cada uno)

CARGA ALTA (1,000+ pedidos/día):
  - 5+ servidores NestJS
  - 1 Redis cluster (3+ nodes)
  - 5+ BullMQ workers dedicados (concurrency 2 cada uno)
  - Separate workers por tipo de job (crítico vs. low-priority)
```

---

**Próxima parte: Redis, Base de Datos, Integraciones**
