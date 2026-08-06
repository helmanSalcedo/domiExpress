# Flujo de Pagos

## Contexto

DomiExpress maneja 3 tipos de transacciones:

1. **Cliente → DomiExpress**: Por productos.
2. **DomiExpress → Comercio**: Liquidación de ventas.
3. **DomiExpress → Domiciliario**: Pago de entregas.

---

## Arquitectura de Pagos

```
┌─────────────┐
│   CLIENTE   │ Paga $100,000
└────┬────────┘
     │ (Wompi)
     ▼
┌──────────────────────────────────────┐
│   CUENTA ESCROW DE DOMIEXPRESS       │
│   $100,000 entra en espera            │
└──────┬──────────────────────────────┘
       │
       ├──► Validación de pago (anti-fraude)
       │
       ├──► Confirmación de comercio
       │
       ├──► Confirmación de entrega
       │
       ├──► Comisión DomiExpress: $10,000 (10%)
       │
       ├──► Pago a Comercio: $90,000
       │
       └──► Deducir costo domiciliario
           de comisión DomiExpress
```

---

## Flujo: Cliente Paga

### Paso 1: Generar Checkout

**Cliente en WhatsApp**: `"Pagar por favor"`

**Backend genera**:
```json
{
  "order_id": "ORD-2024-00234",
  "customer_id": "CUST-5432",
  "total_amount": 68000,
  "currency": "COP",
  "commerce_orders": [
    {
      "commerce_id": "COM-1234",
      "amount": 35000,
      "items": ["Hamburguesa sin tomate"]
    },
    {
      "commerce_id": "COM-5678",
      "amount": 5000,
      "items": ["Coca-Cola grande"]
    },
    {
      "commerce_id": "COM-9101",
      "amount": 28000,
      "items": ["Pizza Hawaiana mediana"]
    }
  ],
  "payment_method": "card",
  "wompi_reference": "REF-123456"
}
```

**Backend llama API de Wompi**:
```
POST https://api.wompi.co/v1/transactions
```

**Wompi responde**:
```json
{
  "data": {
    "id": "TX-12345",
    "amount_in_cents": 6800000,
    "reference": "REF-123456",
    "customer_email": "juan@example.com",
    "status": "PENDING",
    "payment_link": "https://checkout.wompi.co/l/TX-12345",
    "expires_at": "2024-01-15T23:59:59Z"
  }
}
```

**Sistema responde al cliente**:
```
💳 REALIZAR PAGO

Total: $68,000
Referencia: REF-123456

Toca aquí para pagar con Wompi:
https://checkout.wompi.co/l/TX-12345

⏱️ Link válido por 15 minutos
```

---

### Paso 2: Cliente Completa Pago en Wompi

**Cliente abre link** (checkout de Wompi).

**Opciones de pago**:
1. Tarjeta de crédito (Visa, Mastercard, Amex).
2. Transferencia bancaria.
3. Billetera digital (futuro).

**Cliente selecciona tarjeta**.

**Ingresa datos**:
- Número de tarjeta.
- Fecha vencimiento.
- CVV.
- Nombre titular.

**Wompi procesa** (fraud detection):
- Valida BIN.
- Valida monto (no es exagerado).
- Valida geografía (cliente en Colombia).

**Resultado**: ✅ APROBADO.

---

### Paso 3: Webhook de Confirmación

**Wompi envía webhook a DomiExpress**:

```json
POST https://api.domiexpress.app/webhooks/wompi/transaction
{
  "data": {
    "id": "TX-12345",
    "reference": "REF-123456",
    "amount_in_cents": 6800000,
    "status": "APPROVED",
    "payment_method": "CARD",
    "customer_email": "juan@example.com",
    "timestamp": "2024-01-15T18:35:42Z"
  },
  "signature": "hash-firma-wompi"
}
```

**Backend DomiExpress**:
1. Valida firma (HMAC SHA256).
2. Busca `order_id` por `reference`.
3. Actualiza estado de pedido: `PAID`.
4. Crea 3 "sub-payments" (uno por comercio).
5. **NO transfiere dinero aún** (dinero en escrow).

---

### Paso 4: Confirmación al Cliente

**Sistema notifica cliente**:
```
✅ PAGO CONFIRMADO

Referencia: REF-123456
Monto: $68,000 COP
Fecha: 15 de enero, 6:35 PM

Tu pedido está en marcha.

Observaciones importantes:
- El dinero se le transferirá a los comercios
  cuando recibas el pedido.
- Si hay problema, reembolso automático.
```

---

## Flujo: Dinero en Escrow

El dinero **nunca sale de la cuenta de DomiExpress** hasta que:

1. **Cliente recibe pedido** (confirmado con PIN).
2. **No hay disputas** en 24 horas.
3. **Cálculo de comisión** se ejecuta.

### Paso 1: Confirmación de Entrega

**Cliente da PIN**: `"5847"`

**Sistema valida**:
```
✅ PIN correcto
✅ Domiciliario confirmó entrega
✅ Foto de entrega existe
```

**Estado del pedido**: `COMPLETED`.

---

### Paso 2: Ventana de Disputa (24 horas)

**Sistema espera 24 horas** para:
- Cliente reporta problema.
- Comercio reporta no-pago.
- Domiciliario reporta accidente.

**Cliente puede reportar**:
```
"El pedido llegó dañado"
"Falta un producto"
"El precio no era ese"
```

#### Caso A: Sin Disputa

Después de 24h sin reporte → **Proceder a pago**.

#### Caso B: Con Disputa

**Sistema abre proceso**:
- Notifica ambas partes.
- Pide evidencia (fotos, mensajes).
- Admin revisa en máximo 48h.
- **Veredicto**: Favor cliente (reembolso) o favor comercio (pago).

---

### Paso 3: Cálculo de Distribución

**Dinero entra en escrow**: $68,000

**Cálculo**:
```
Ingresos totales: $68,000

Por comercio:
  Don Julio ($35,000):
    - Comisión DomiExpress (10%): $3,500
    - A comercio: $31,500

  Tienda Don Pepe ($5,000):
    - Comisión DomiExpress (10%): $500
    - A comercio: $4,500

  Pizzalandia ($28,000):
    - Comisión DomiExpress (10%): $2,800
    - A comercio: $25,200

Total comisión DomiExpress: $6,800

De la comisión:
  - Domiciliario: $3,500
  - Infraestructura/Ganancia: $3,300

Pago a comercios: $31,500 + $4,500 + $25,200 = $61,200
Pago a domiciliarios: $3,500
Ganancia neta DomiExpress: $3,300
```

---

### Paso 4: Transferencia a Comercios

**Scheduling** (cada 24 horas, a las 11 PM):

**Backend**:
```
FOR EACH (completed_order AND no_dispute) {
  amount_to_transfer = order_total - commission

  FOR EACH commerce {
    CREATE transaction TO commerce_bank_account
    EXECUTE at 11:01 PM
  }
}
```

**Ejemplo**: Don Julio recibe $31,500 a las 11:01 PM.

**Metadata para auditoría**:
```json
{
  "type": "COMMERCE_PAYOUT",
  "commerce_id": "COM-1234",
  "commerce_name": "Don Julio",
  "orders": ["ORD-2024-00234"],
  "gross_amount": 35000,
  "commission": 3500,
  "net_amount": 31500,
  "bank_account": "3123456789",
  "timestamp": "2024-01-16T23:01:30Z"
}
```

---

### Paso 5: Transferencia a Domiciliarios

**Scheduling** (cada 7 días, viernes a las 11 PM):

**Backend agrupa** todas las entregas de la semana:
```
Carlos Rodríguez:
  - Semana 1: 47 entregas
  - Ingresos base: 47 × $3,500 = $164,500
  - Bonificación (5 entregas con bonus de tiempo): +$10,000
  - Total a pagar: $174,500
```

**Transferencia**:
```
TRANSFER $174,500 TO Carlos's bank account
(viernes 11 PM)
```

**Notificación**:
```
✅ Liquidación realizada

Semana 1 (6 - 12 enero):
- Entregas: 47
- Pago base: $164,500
- Bonificaciones: $10,000
- Descuentos: $0
- Total recibido: $174,500

Próxima liquidación: viernes 19 enero
```

---

## Métodos de Pago para Domiciliarios

### Opción 1: Transferencia Bancaria

**Requisito**: Cuenta bancaria colombiana.

**Proceso**:
- Domiciliario registra IBAN.
- Sistema valida cuenta.
- Pago automático semanal.
- Costo: $0 (DomiExpress cubre comisión bancaria).

### Opción 2: Billetera Digital (Futuro)

**Plataformas**: Nequi, Daviplata, etc.

**Proceso**: TBD.

### Opción 3: Efectivo en Punto (Futuro)

**Ubicaciones**: Oficinas de DomiExpress en municipio.

**Proceso**: Domiciliario retira efectivo.

---

## Flujo: Reembolso (Disputa)

### Escenario: Cliente Reporta Problema

**Cliente escribe**: `"Me llegó la hamburguesa quemada (foto)"`

**Sistema**:
```
⚠️ REPORTE DE PROBLEMA

Foto recibida: ✅
Descripción: Hamburguesa quemada
Estado del pedido: COMPLETED

Abriendo disputa...

Don Julio y soporte han sido notificados.

Veredicto en máximo 48 horas.
```

**Admin revisa**:
- Foto del cliente: Hamburguesa visiblemente quemada.
- Historial de Don Julio: 98% de ratings positivos.
- Contexto: Error aislado.

**Veredicto**: Reembolso.

**Proceso**:
```
1. Cliente: $68,000 DEVUELTO a tarjeta (Wompi).
2. Don Julio: -$35,000 de próxima liquidación.
3. Comisión DomiExpress: Se devuelve a escrow.
4. Domiciliario: $3,500 MANTENIDOS (completó su trabajo).
```

**Notificación a cliente**:
```
✅ DISPUTA RESUELTA

Resultado: Reembolso aprobado
Monto: $68,000 COP

Se devolverá a tu tarjeta en 3-5 días hábiles.
(Wompi procesa devoluciones)

Lamentamos la experiencia. Usá el código
BURGER2024 para $10,000 de descuento.
```

**Notificación a Don Julio**:
```
⚠️ DISPUTA PERDIDA

Pedido: ORD-2024-00234
Razón: Producto defectuoso

Se ha deducido $35,000 de tu liquidación.

¿Quieres apelar? Tienes 48 horas.
```

---

## Seguridad de Pagos

### Anti-Fraude (Wompi + DomiExpress)

**Wompi detecta**:
- Tarjetas clonadas.
- Montos anómalos.
- Geografía sospechosa.

**DomiExpress añade**:
- Verificación de cliente (teléfono, ubicación).
- Límite de transacciones por cliente/IP.
- Scoring de riesgo por comercio (if commercio tiene muchas disputas).

### Rate Limiting

```
- Cliente: Máximo 10 transacciones/hora
- Máximo $5,000,000/día por cliente
- Máximo $50,000,000/día por tarjeta
```

### Encriptación

- Wompi maneja PCI-DSS (nunca guardamos números de tarjeta).
- Tokens de Wompi se usan para retransmitir.
- Números de tarjeta nunca pasan por servidores de DomiExpress.

---

## Auditoría de Pagos

**Todos los pagos se auditan**:

```
Table: payment_audit_log

Columnas:
- transaction_id (PK)
- order_id
- customer_id
- commerce_id
- domiciliary_id
- amount
- status (PENDING, APPROVED, DISPUTED, REFUNDED)
- method (CARD, BANK_TRANSFER, etc.)
- timestamp
- ip_address
- device_id
- wompi_reference
```

**Acceso**: Solo admins + auditoría externa.

**Retención**: 7 años (compliance contable).

---

## Reconciliación

**Daily Reconciliation** (1 AM):

```
1. Traer transacciones de Wompi API.
2. Comparar con BD de DomiExpress.
3. Detectar discrepancias.
4. Alertar si:
   - Wompi dice APPROVED pero BD dice PENDING.
   - Monto en BD ≠ Monto en Wompi.
   - Transacción en Wompi pero no en BD.
```

---

## Casos Edge

### Caso 1: Cliente Paga, Pero No Hay Domiciliarios

**Estado**: Pago procesado, pero pedido está en WAITING_DRIVER.

**Después de 30 minutos sin domiciliario**:

```
⚠️ No hay domiciliarios disponibles

Opciones:
1. Esperar (máximo 1 hora más)
2. Reagendar para mañana
3. Cancelar y recibir reembolso

¿Qué prefieres?
```

**Si cliente cancela**:
- Reembolso inmediato a tarjeta (Wompi).
- Comisión DomiExpress NO se cobra.

---

### Caso 2: Comercio Rechaza Todas las Órdenes

**Después de 3 rechazos**:

```
⚠️ Comercio no puede procesar

Reembolsando $35,000...

Se devolverá a tu tarjeta en 3-5 días.
Lamentamos la experiencia.
```

---

## Reportería

**Dashboard financiero** (solo admin):

```
Hoy (15 de enero):
- Transacciones: 234
- Volumen total: $18,500,000
- Comisión recibida: $1,850,000
- Pagos a comercios: $16,650,000
- Pagos a domiciliarios: $1,200,000
- Disputas: 3 (todas resueltas)

Tasa de conversión: 98.7% (completadas/iniciadas)
Promedio de transacción: $79,000
Tasa de disputa: 1.3%
```

---

**Propósito**: Documentar cómo fluye el dinero. Sistema debe ser transparent, auditable, y seguro.
