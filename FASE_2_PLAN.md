# 🚀 FASE 2: PAYMENTS & DELIVERIES - PLAN DETALLADO

**Inicio:** 2026-08-13
**Duración estimada:** 5-7 días
**Progreso MVP:** 20% → 40%

---

## 📋 TAREAS PRINCIPALES

### **TAREA 1: PAYMENTS WEBHOOK (2-3 días)**

#### Subtareas:
- [ ] 1. Mejora payments.service.ts
  - [ ] 1.1. Crear orden en Wompi
  - [ ] 1.2. Procesar respuesta
  - [ ] 1.3. Manejar errores
  - [ ] 1.4. Webhook Wompi

- [ ] 2. Crear wompi.client.ts mejorado
  - [ ] 2.1. POST /transactions
  - [ ] 2.2. GET /transactions
  - [ ] 2.3. POST /refunds
  - [ ] 2.4. Error handling

- [ ] 3. Webhook controller
  - [ ] 3.1. Recibir pagos Wompi
  - [ ] 3.2. Validar firma
  - [ ] 3.3. Actualizar status orden
  - [ ] 3.4. Registrar en BD

- [ ] 4. Tests payments
  - [ ] 4.1. Crear pago exitoso
  - [ ] 4.2. Crear pago rechazado
  - [ ] 4.3. Procesar refund
  - [ ] 4.4. Webhook validations

#### Archivos:
```
src/modules/payments/
├── services/payments.service.ts      [MEJORAR]
├── wompi-client/wompi.client.ts      [MEJORAR]
├── controllers/payments.controller.ts [MEJORAR]
├── dto/payment-webhook.dto.ts        [CREAR]
├── dto/payment-response.dto.ts       [CREAR]
└── services/payments.service.spec.ts [CREAR - Tests]
```

---

### **TAREA 2: DELIVERIES SERVICE (2-3 días)**

#### Subtareas:
- [ ] 1. Deliveries service completo
  - [ ] 1.1. Crear entrega
  - [ ] 1.2. Asignar repartidor
  - [ ] 1.3. Actualizar estado
  - [ ] 1.4. Confirmar entrega

- [ ] 2. Driver assignment service (nuevo)
  - [ ] 2.1. Algoritmo nearest-driver
  - [ ] 2.2. Validar disponibilidad
  - [ ] 2.3. Notificar driver
  - [ ] 2.4. Manejo de rechazos

- [ ] 3. State machine para entregas
  - [ ] 3.1. Estados válidos
  - [ ] 3.2. Transiciones
  - [ ] 3.3. Validaciones

- [ ] 4. Real-time tracking (preparado)
  - [ ] 4.1. WebSocket para GPS
  - [ ] 4.2. Actualizar posición
  - [ ] 4.3. Notificar cliente

- [ ] 5. Tests deliveries
  - [ ] 5.1. Crear entrega
  - [ ] 5.2. Asignar driver
  - [ ] 5.3. State transitions
  - [ ] 5.4. Edge cases

#### Archivos:
```
src/modules/deliveries/
├── services/deliveries.service.ts           [MEJORAR]
├── services/driver-assignment.service.ts    [CREAR]
├── state-machine/delivery.state-machine.ts  [CREAR]
├── dto/delivery.dto.ts                      [MEJORAR]
├── dto/assign-driver.dto.ts                 [CREAR]
└── services/deliveries.service.spec.ts      [CREAR - Tests]
```

---

### **TAREA 3: EARNINGS CALCULATION (1 día)**

#### Subtareas:
- [ ] 1. Driver earnings service
  - [ ] 1.1. Calcular tarifa base
  - [ ] 1.2. Bonificaciones
  - [ ] 1.3. Penalizaciones
  - [ ] 1.4. Total ganancias

- [ ] 2. DTOs y validación
  - [ ] 2.1. Earnings response
  - [ ] 2.2. Payment request

- [ ] 3. Tests earnings
  - [ ] 3.1. Cálculo correcto
  - [ ] 3.2. Bonificaciones
  - [ ] 3.3. Penalizaciones

#### Archivos:
```
src/modules/driver-earnings/
├── services/driver-earnings.service.ts      [MEJORAR]
├── dto/earnings.dto.ts                      [MEJORAR]
└── services/driver-earnings.service.spec.ts [CREAR - Tests]
```

---

### **TAREA 4: INTEGRACIÓN (1 día)**

#### Subtareas:
- [ ] 1. Integrar Payments con Orders
  - [ ] 1.1. Crear payment al crear orden
  - [ ] 1.2. Actualizar orden con payment ID
  - [ ] 1.3. Sincronizar estados

- [ ] 2. Integrar Deliveries con Orders
  - [ ] 2.1. Crear delivery al confirmar orden
  - [ ] 2.2. Actualizar orden con delivery ID
  - [ ] 2.3. Sincronizar estados

- [ ] 3. Integrar Earnings con Deliveries
  - [ ] 3.1. Crear earning al completar
  - [ ] 3.2. Calcular automáticamente
  - [ ] 3.3. Notificar driver

- [ ] 4. E2E tests
  - [ ] 4.1. Orden → Pago → Entrega
  - [ ] 4.2. Driver earnings flow
  - [ ] 4.3. Casos de error

---

## 🎯 FLUJOS DE DATOS

### Flujo 1: Crear Orden → Pago → Entrega

```
Cliente
  ↓
POST /orders
  ↓
OrdersService.createOrder()
  ├─ Crear Order (PENDING)
  ├─ Crear Payment (PENDING)
  └─ Retornar OrderResponseDto
  ↓
Cuando cliente paga:
  ├─ Webhook Wompi recibe pago
  ├─ PaymentsController.webhook()
  ├─ Actualizar Payment (APPROVED)
  ├─ Actualizar Order (CONFIRMED)
  └─ Crear Delivery (PENDING)
  ↓
Cuando se asigna driver:
  ├─ DriverAssignmentService.assign()
  ├─ Encontrar driver más cercano
  ├─ Crear DriverEarning
  ├─ Actualizar Delivery (ASSIGNED)
  └─ Notificar driver
  ↓
Cuando se completa:
  ├─ Delivery (DELIVERED)
  ├─ Order (COMPLETED)
  ├─ DriverEarning (COMPLETED)
  └─ Notificar cliente
```

---

## 📊 ARQUITECTURA DE FASE 2

```
Payment Flow:
Wompi API ←→ PaymentsService ←→ OrdersService
    ↓
Payment Webhook ←→ PaymentController

Delivery Flow:
DriverAssignmentService ←→ DeliveriesService ←→ OrdersService
    ↓
Driver Notifications

Earnings Flow:
DriverEarningService ←→ DeliveriesService
    ↓
Driver Payments
```

---

## 📅 CRONOGRAMA

```
Día 1-2: Payments (Wompi webhook, validaciones)
Día 2-3: Deliveries (Service, assignment)
Día 3-4: Driver assignment (algoritmo)
Día 4-5: Earnings (cálculos)
Día 5-6: Integración y E2E tests
Día 6-7: Polish, documentation, deploy staging
```

---

## ✅ CRITERIOS DE ÉXITO

### Payments
- ✅ Crear pago en Wompi
- ✅ Webhook procesa pagos
- ✅ Estado sincroniza con Order
- ✅ Refunds funciona
- ✅ 10+ tests pasan

### Deliveries
- ✅ Crear entrega al confirmar orden
- ✅ Asignar driver automáticamente
- ✅ State machine validado
- ✅ Tracking en tiempo real (preparado)
- ✅ 10+ tests pasan

### Earnings
- ✅ Cálculos correctos
- ✅ Bonificaciones aplican
- ✅ Penalizaciones aplican
- ✅ Totales exactos
- ✅ 5+ tests pasan

### Integración
- ✅ Flujo orden → pago → entrega funciona
- ✅ Estados sincronizados
- ✅ Notificaciones enviadas
- ✅ 5+ E2E tests pasan

---

## 🚀 EMPEZAMOS AHORA

**Próximo paso:** Implementar Payments Service
