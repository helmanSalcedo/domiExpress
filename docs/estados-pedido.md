# Estados del Pedido

## Diagrama de Estados

```
                  ┌─────────────────────────────────────┐
                  │  CLIENTE INICIA BÚSQUEDA             │
                  └────────┬────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────┐      ┌──────────┐      ┌──────────────┐
    │ CART    │      │ SEARCH   │      │ PENDING_PAY  │
    └────┬────┘      └────┬─────┘      └──────┬───────┘
         │                │                   │
         └────────┬───────┴───────────────────┘
                  │
                  ▼
            ┌──────────────┐
            │ PAYMENT_LINK │  (Link de Wompi activo por 15 min)
            └──────┬───────┘
                   │
         ┌─────────┴─────────┐
         │ (Error o timeout) │
         │ ↓ PAYMENT_FAILED  │
         │ Mostrar link      │
         └─────────┬─────────┘
                   │
                   ▼
            ┌──────────────┐
            │ PAYMENT_OK   │  (Dinero en escrow)
            └──────┬───────┘
                   │
                   ▼
        ┌────────────────────────┐
        │ PENDING_MERCHANT_ACK   │  (En 60 segundos)
        └─────┬──────────────────┘
              │
    ┌─────────┴──────────┐
    │ (Validar inventario)│
    └─────────┬──────────┘
              │
    ┌─────────┴────────────┐
    │                      │
    ▼                      ▼
┌─────────────┐    ┌─────────────────┐
│ REJECTED    │    │ PENDING_PICKUP  │
└─────────────┘    └────────┬────────┘
                           │
                           ▼
                   ┌──────────────────┐
                   │ READY_TO_PICKUP  │ (Comercio confirmó "LISTO")
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ ASSIGNED_DRIVER  │ (Domiciliario aceptó)
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ IN_PICKUP        │ (Domiciliario en comercio)
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ IN_DELIVERY      │ (Domiciliario en ruta)
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ DELIVERED        │ (Cliente confirmó con PIN)
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ RATING           │ (Cliente calificando)
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ COMPLETED        │ (Pedido finalizado)
                   └──────────────────┘

ESTADOS FINALES (Terminal):
- COMPLETED ✅
- REJECTED ❌
- CANCELLED ⭕
- FAILED ❌
```

---

## Estados Detallados

### 1. CART
**Descripción**: Cliente está agregando productos al carrito.

**Duración típica**: 2-10 minutos.

**Transiciones**:
- → SEARCH: Cliente agrega más productos.
- → PAYMENT_LINK: Cliente revisa y paga.

**Datos capturados**:
- Productos en carrito.
- Comercios seleccionados.
- Personalizaciones.

**Cliente ve**:
```
📋 CARRITO

1. Hamburguesa (Don Julio) - $35,000
2. Pizza (Pizzalandia) - $28,000

Total: $63,000

¿Agregar más? LISTO / AGREGAR
```

---

### 2. SEARCH
**Descripción**: Sistema buscando productos o alternativas.

**Duración típica**: <5 segundos.

**Transiciones**:
- → CART: Encontró productos.
- → SEARCH: Usuario reformula búsqueda.

**Backend**:
- IA procesando texto.
- BD buscando productos.
- Ranking de comercios.

**Cliente ve**:
```
🔍 Buscando en Timbío...

(Esperando respuesta)
```

---

### 3. PENDING_PAY
**Descripción**: Cliente inició checkout pero no finalizó pago.

**Duración típica**: <3 segundos.

**Transiciones**:
- → PAYMENT_LINK: Sistema genera link de Wompi.

**Backend**:
- Cálculo de totales.
- Creación de transacción en Wompi.
- Reserva de dinero.

---

### 4. PAYMENT_LINK
**Descripción**: Link de pago enviado al cliente, esperando pago.

**Duración típica**: 15 minutos (TTL del link).

**Transiciones**:
- → PAYMENT_OK: Cliente completó pago.
- → PAYMENT_FAILED: Link expiró o pago rechazado.

**Datos capturados**:
- Link de Wompi.
- Timestamp de generación.
- IP del cliente.

**Cliente ve**:
```
💳 REALIZAR PAGO

Toca: https://checkout.wompi.co/l/TX-12345

⏱️ Link expira en: 14 min 30 seg
```

---

### 5. PAYMENT_FAILED
**Descripción**: Pago fue rechazado o link expiró.

**Razones**:
- Tarjeta rechazada (fondos insuficientes, bloqueada).
- Fraude detectado (Wompi).
- Link expiró.
- Cliente cerró pestaña.

**Duración típica**: Hasta que cliente reintentar.

**Transiciones**:
- → PAYMENT_LINK: Generar nuevo link.
- → CANCELLED: Cliente abandonó.

**Cliente ve**:
```
❌ PAGO RECHAZADO

Razón: Fondos insuficientes

¿Reintentar?

[BOTÓN] GENERAR NUEVO LINK
[BOTÓN] CANCELAR PEDIDO (reembolso)
```

**Notas**:
- No se genera un nuevo transacción en Wompi (evita duplicados).
- Se reutiliza la referencia anterior.

---

### 6. PAYMENT_OK
**Descripción**: Pago fue aprobado. Dinero en escrow.

**Duración típica**: <5 segundos (enviando a comercios).

**Transiciones**:
- → PENDING_MERCHANT_ACK: Notificando a comercios.

**Datos capturados**:
- Referencia de Wompi.
- Timestamp de pago.
- Métodos de pago usado.
- Información del cliente (anónima).

**Backend**:
- Valida firma de Wompi.
- Crea records de "sub-payment" (uno por comercio).
- Notifica comercios en paralelo.
- Notifica cliente.

**Cliente ve**:
```
✅ PAGO CONFIRMADO

Referencia: REF-123456

Esperando confirmación de comercios...

📍 Don Julio - Hamburguesa ($35,000)
📍 Pizzalandia - Pizza ($28,000)
```

---

### 7. PENDING_MERCHANT_ACK
**Descripción**: Notificaciones enviadas a comercios. Sistema esperando respuesta.

**Duración típica**: 30-60 segundos.

**Transiciones**:
- → READY_TO_PICKUP: Todos los comercios aceptaron.
- → REJECTED: Uno o más rechazaron.
- → PARTIAL_REJECTED: Algunos aceptaron, otros rechazaron.

**Timeout**: Si no responden en 60 segundos, se considera REJECTED automáticamente.

**Datos capturados**:
- Timestamps de notificación a cada comercio.
- Timestamps de aceptación/rechazo.

**Cliente ve**:
```
⏳ Contactando comercios...

📍 Don Julio - ⏳
📍 Pizzalandia - ✅ (Aceptado)
```

---

### 8. REJECTED
**Descripción**: Uno o más comercios rechazaron pedido.

**Razones**:
- Producto agotado.
- Capacidad de cocina limitada.
- Comercio offline.
- Error humano.

**Duración típica**: Hasta que cliente decida (puede reagendar).

**Transiciones**:
- → CART: Cliente modifica carrito (elige alternativas).
- → CANCELLED: Cliente cancela.
- → SEARCH: Cliente busca productos similares.

**Dinero**: Regresa a escrow, NO se cobra comisión.

**Cliente ve**:
```
⚠️ UN COMERCIO RECHAZÓ

Don Julio no tiene hamburguesa de pollo.

¿Quieres...?

1. 🍔 Hamburguesa de res de Don Julio ($38,000)
2. 🍔 Hamburguesa de pollo de Gourmet ($50,000)
3. ❌ Cancelar este comercio
4. 🔄 Modificar el carrito

Escribe el número.
```

---

### 9. PARTIAL_REJECTED
**Descripción**: Algunos comercios aceptaron, otros rechazaron.

**Ejemplo**:
- Don Julio: ✅ Aceptó.
- Pizzalandia: ❌ Rechazó.

**Transiciones**:
- → READY_TO_PICKUP: Cliente reemplaza Pizzalandia con otro comercio.

**Cliente ve**:
```
⚠️ PARCIAL ACEPTADO

✅ Don Julio - Hamburguesa ($35,000)
❌ Pizzalandia - Pizza (RECHAZADO - Agotada)

¿Qué hacemos?

1. 🍕 Otra pizza de otro comercio
2. ❌ Quitar pizza del pedido
3. 🔄 Cancelar todo y modificar

Escribe el número.
```

---

### 10. READY_TO_PICKUP
**Descripción**: Todos los comercios aceptaron. Sistema asignando domiciliario.

**Duración típica**: 10-30 segundos.

**Transiciones**:
- → ASSIGNED_DRIVER: Domiciliario aceptó.
- → WAITING_DRIVER: No hay domiciliarios disponibles.

**Backend**:
- Busca domiciliarios en rango.
- Calcula distancia.
- Usa algoritmo de matching (proximidad, rating, disponibilidad).
- Notifica domiciliario en paralelo.

**Cliente ve**:
```
🎉 TODOS ACEPTARON

Encontrando domiciliario...

⏳ ETA: 20 minutos
```

---

### 11. WAITING_DRIVER
**Descripción**: No hay domiciliarios disponibles en rango.

**Razones**:
- Hora pico sin suficiente oferta.
- Zona alejada del centro.
- Todos los domiciliarios rechazaron (raramente).

**Duración típica**: Hasta 1 hora (después auto-cancelar).

**Transiciones**:
- → ASSIGNED_DRIVER: Domiciliario aceptó.
- → CANCELLED: 1 hora sin domiciliario.

**Backend**:
- Renotifica cada 2 minutos.
- Expande el rango de búsqueda.
- Ofrece incentivos (bonus) a domiciliarios.

**Cliente ve**:
```
⏳ ESPERANDO DOMICILIARIO

No hay domiciliarios disponibles en este momento.

Opciones:

1. ⏳ Esperar (máximo 1 hora)
2. 🔄 Reagendar para luego
3. ❌ Cancelar y recibir reembolso

¿Qué prefieres?
```

---

### 12. ASSIGNED_DRIVER
**Descripción**: Domiciliario aceptó el pedido.

**Duración típica**: 20-60 segundos (cliente da ubicación).

**Transiciones**:
- → IN_PICKUP: Cliente compartió ubicación, domiciliario en ruta.

**Backend**:
- Calcula ETA.
- Notifica cliente con detalles del domiciliario.

**Cliente ve**:
```
✅ DOMICILIARIO ASIGNADO

🚗 Carlos Rodríguez
📱 +57 310 555 5555
🏍️ Moto - VKX-2034
⭐ 4.8/5 (52 entregas)

Recolectando en:
1. Don Julio (0.8 km)
2. Pizzalandia (0.5 km)

ETA: 15 minutos a tu puerta
```

---

### 13. IN_PICKUP
**Descripción**: Domiciliario está recolectando productos en comercios.

**Duración típica**: 5-15 minutos.

**Transiciones**:
- → IN_DELIVERY: Recolectó todo, en ruta a cliente.

**Actualización de cliente**:
```
🏪 Carlos está recolectando en Don Julio

Distancia a ti: 1.2 km
ETA: 12 minutos
```

**Cada minuto**: Actualización automática de ubicación (en tiempo real en mapa).

---

### 14. IN_DELIVERY
**Descripción**: Domiciliario recolectó todo, en ruta a cliente.

**Duración típica**: 3-10 minutos.

**Transiciones**:
- → DELIVERED: Domiciliario llegó, cliente confirmó con PIN.

**Actualización cada 3 minutos**:
```
📍 Carlos está en camino

Distancia a ti: 400 metros
ETA: 2 minutos

¡Abre la puerta! 🚪
```

**Notificación 1 km antes**:
```
📍 Carlos está a 1 km

Está muy cerca. Prepárate.
```

**Notificación 100m antes**:
```
🚪 ¡LLEGA EN 1 MINUTO!

Abre la puerta. Carlos está aquí.
```

---

### 15. DELIVERED
**Descripción**: Domiciliario llegó, cliente debe confirmar con PIN.

**Duración típica**: 30-60 segundos.

**Transiciones**:
- → RATING: Cliente confirmó PIN.
- → DISPUTED: Cliente rechaza (producto quemado, etc.).

**Cliente ve**:
```
📲 Carlos envía foto del pedido

[FOTO]

🔐 Código de confirmación: 5847

Verifica la foto. Luego escribe el código
que te dice Carlos.

Código: _____
```

**Reglas**:
- Si cliente no confirma en 5 minutos, domiciliario puede abandonar.
- Dinero permanece en escrow.
- Cliente puede reclamo después (disputa).

**Backend**:
- Valida PIN.
- Captura geolocalización (confirmación de entrega).
- Tiempo de entrega vs. ETA.

---

### 16. RATING
**Descripción**: Cliente calificando experiencia.

**Duración típica**: 30-120 segundos.

**Transiciones**:
- → COMPLETED: Cliente calificó.

**Cliente ve**:
```
⭐ CALIFICA TU EXPERIENCIA

Comida:    ⭐⭐⭐⭐⭐
Entrega:   ⭐⭐⭐⭐⭐
Comercio:  ⭐⭐⭐⭐⭐

Comentarios (opcional):
"Todo excelente, muy rápido!"

[BOTÓN] ENVIAR CALIFICACIÓN
```

**Datos capturados**:
- Rating de cada comercio (1-5 estrellas).
- Rating del domiciliario (1-5 estrellas).
- Comentario libre.
- Timestamp.

---

### 17. COMPLETED
**Descripción**: Pedido finalizado. Dinero liberado de escrow.

**Duración típica**: 24 horas después de DELIVERED (ventana de disputa).

**Transiciones**:
- → Terminal (no hay más transiciones).
- **Pero**: → DISPUTED si cliente abre disputa antes de 24h.

**Backend**:
- Cálculo de comisión.
- Transferencias a comercios.
- Archivado de logs.
- Generación de factura (si aplica).

**Cliente ve**:
```
✅ PEDIDO COMPLETADO

Resumen:

1. Hamburguesa sin tomate (Don Julio) - $35,000
2. Pizza Hawaiana (Pizzalandia) - $28,000
   ⭐⭐⭐⭐⭐

Total pagado: $63,000
Tiempo de entrega: 22 minutos

Gracias por tu compra!

¿Qué quieres hoy? 😊
```

---

## Estados Finales (Terminal)

### CANCELLED
**Razones**:
- Cliente canceló antes de pago.
- Cliente canceló después de rechazo.
- Sistema auto-canceló (no hay domiciliarios en 1h).

**Dinero**: Retorna a tarjeta del cliente (si fue pagado).

**Duración**: Reembolso en 3-5 días hábiles (Wompi).

---

### DISPUTED
**Descripción**: Cliente reportó problema post-entrega.

**Ejemplos**:
- Producto llegó dañado.
- Falta un producto.
- Precio incorrecto.

**Duración**: 24-48 horas (resolución por admin).

**Transiciones**:
- → REFUNDED: Admin decidió favor del cliente.
- → COMPLETED: Admin decidió favor del comercio.

---

## Datos Capturados en Cada Estado

| Estado | Datos | Propósito |
|--------|-------|-----------|
| CART | Productos, personalizaciones | Análisis de abandono |
| SEARCH | Query, resultados, timestamp | ML para IA |
| PAYMENT_LINK | Wompi ref, timestamp, IP | Auditoría y fraude |
| PAYMENT_OK | Wompi approval, amount | Auditoría financiera |
| PENDING_MERCHANT_ACK | Merchant IDs, timestamp | SLA tracking |
| REJECTED | Merchant ID, reason | Análisis de rechazo |
| ASSIGNED_DRIVER | Driver ID, ETA, route | Optimización de ruta |
| IN_DELIVERY | Location stream (cada 15s) | GPS tracking, auditoría |
| DELIVERED | Photo, PIN, timestamp | Confirmación de entrega |
| RATING | Stars, comment, timestamp | QA, NPS |
| COMPLETED | Final state, archive | Compliance |

---

**Propósito**: Documentar cada etapa del pedido. Backend debe ser state machine perfectamente definido para evitar race conditions y transiciones inválidas.
