# Flujo de Cliente por WhatsApp

## Contexto

El cliente NUNCA descarga una app. Todo ocurre en WhatsApp:
- Búsqueda de productos.
- Selección de comercios.
- Personalización.
- Pago.
- Seguimiento.

## Estados de Conversación

El cliente puede estar en varios estados simultáneamente (multi-pedido).

### Estados Principales

```
IDLE (Inactivo)
  ↓
SEARCH (Buscando productos)
  ↓
BROWSE (Viendo comercios/precios)
  ↓
CART (Agregando productos)
  ↓
LOCATION (Compartir ubicación)
  ↓
PAYMENT (Pagando)
  ↓
CONFIRMED (Pedido confirmado)
  ↓
DELIVERY (En camino)
  ↓
COMPLETED (Entregado)
```

Puede volver a SEARCH en cualquier momento para agregar más comercios.

## Flujo Detallado: Primer Contacto

### Paso 1: Cliente inicia contacto

**Cliente escribe**: `"Hola, ¿qué venden?"`

**Sistema responde**:
```
¡Bienvenido a DomiExpress! 👋

Estás en Timbío, Cauca.

¿Qué quieres hoy? Escribe lo primero que se te venga a la mente:
- "Una pizza hawaiana"
- "Medicinas para la gripe"
- "Pan integral"
- "Flores para mi novia"

Yo me encargo de encontrar todo.
```

**Estado**: `IDLE → SEARCH`

---

### Paso 2: Cliente describe qué quiere

**Cliente escribe**: `"Quiero una hamburguesa de pollo sin tomate con mucho queso y una Coca-Cola grande"`

**Backend IA procesa**:
```json
{
  "intent": "search",
  "products": [
    {
      "name": "hamburguesa",
      "protein": "pollo",
      "customizations": ["sin tomate", "mucho queso"],
      "quantity": 1
    },
    {
      "name": "Coca-Cola",
      "size": "grande",
      "quantity": 1
    }
  ],
  "categories": ["restaurante", "comida rápida", "tienda"],
  "confidence": 0.95
}
```

**Sistema responde** (máximo 10 segundos):
```
🔍 Buscando en Timbío...

Encontré:

🍔 HAMBURGUESAS (5 comercios)
1. Burguerking - Hamburguesa de pollo $40,000 ⭐⭐⭐⭐ (285 reviews)
2. Don Julio - Hamburguesa de pollo $35,000 ⭐⭐⭐⭐⭐ (142 reviews)
3. Gourmet Burger - Hamburguesa de pollo $50,000 ⭐⭐⭐⭐⭐ (89 reviews)
4. Comida Rápida Central - $38,000 ⭐⭐⭐ (45 reviews)
5. El Traqueto - $32,000 ⭐⭐ (12 reviews)

🥤 COCA-COLA GRANDE (8 comercios)
1. Tienda Don Pepe - $5,000 (500+ compras)
2. Supermercado Total - $4,900 (300+ compras)
3. Licorera La Pulpería - $5,500
...

¿Cuál te interesa? Escribe el número o nombre.
```

**Estado**: `SEARCH → BROWSE`

---

### Paso 3: Cliente Selecciona Comercios

**Cliente escribe**: `"La de Don Julio y la Coca-Cola de Don Pepe"`

**Sistema responde**:
```
✅ Agregado:
- 1x Hamburguesa de pollo (Don Julio) - $35,000
  (Sin tomate, mucho queso)
- 1x Coca-Cola grande (Tienda Don Pepe) - $5,000

Total: $40,000

¿Algo más? O escribe "LISTO" para proceder.
```

**Estado**: `BROWSE → CART`

---

### Paso 4: Personalización y Confirmar Carrito

**Cliente escribe**: `"Agregar una pizza hawaiana de Pizzalandia"`

**Sistema busca y responde**:
```
🍕 PIZZA HAWAIANA

Encontré en 3 comercios:
1. Pizzalandia - Mediana $28,000 ⭐⭐⭐⭐⭐ (200 reviews)
2. El Horno - Mediana $25,000 ⭐⭐⭐ (50 reviews)
3. Las Reinas - Pequeña $20,000 ⭐⭐⭐⭐ (120 reviews)

¿Cuál y de qué tamaño?
```

**Cliente escribe**: `"Pizzalandia, mediana"`

**Sistema actualiza carrito**:
```
📋 CARRITO ACTUALIZADO

1. Hamburguesa de pollo (Don Julio) - $35,000
   → Sin tomate, mucho queso

2. Coca-Cola grande (Tienda Don Pepe) - $5,000

3. Pizza Hawaiana mediana (Pizzalandia) - $28,000

📊 Resumen:
- 3 comercios
- 3 productos
- Total: $68,000

¿Proceder a pagar? Escribe "PAGAR" o "AGREGAR MÁS"
```

**Estado**: `CART → LOCATION`

---

### Paso 5: Compartir Ubicación

**Cliente escribe**: `"PAGAR"`

**Sistema responde**:
```
¡Casi listo! 📍

Necesito saber dónde vives para calcular el tiempo de entrega.

Comparte tu ubicación de WhatsApp o escribe "Cra 5 #3-45, Timbío".
```

**Cliente comparte ubicación por WhatsApp** (opción nativa).

**Sistema valida**:
```
✅ Ubicación confirmada: Cra 5, Timbío
✅ Dentro de cobertura (2.3 km del centro)

Estimas de entrega:
- Don Julio (0.8 km): 12 minutos
- Tienda Don Pepe (1.2 km): 15 minutos
- Pizzalandia (0.5 km): 8 minutos
- Entrega total: ~20 minutos

¿Proceder? Escribe "SÍ" o "CAMBIAR UBICACIÓN"
```

**Estado**: `LOCATION → PAYMENT`

---

### Paso 6: Pago

**Cliente escribe**: `"SÍ"`

**Sistema responde**:
```
💳 ELEGIR MÉTODO DE PAGO

1️⃣ Tarjeta de crédito/débito (Wompi)
2️⃣ Transferencia bancaria (futuro)
3️⃣ Billetera digital (futuro)

Escribe el número.
```

**Cliente escribe**: `"1"`

**Sistema genera link de pago**:
```
💳 Pagar con Wompi

Total: $68,000

Toca aquí: https://checkout.wompi.co/...

Una vez pagues, tu pedido se confirma automáticamente.
```

**Cliente abre link, completa pago**.

**Sistema recibe webhook de Wompi**:
```
✅ PAGO CONFIRMADO

Tu pedido está en marcha. Recibirás actualizaciones aquí.
```

**Estado**: `PAYMENT → CONFIRMED`

---

### Paso 7: Confirmación y Notificaciones

**Sistema notifica 3 comercios en paralelo**:

**A Don Julio**:
```
🎯 NUEVO PEDIDO
Cliente: Juan García
Ubicación: Cra 5, Timbío
Pedido: 1x Hamburguesa de pollo sin tomate, mucho queso
Total: $35,000

✅ ACEPTAR
❌ RECHAZAR
```

**A Tienda Don Pepe**:
```
🎯 NUEVO PEDIDO
Cliente: Juan García
Ubicación: Cra 5, Timbío
Pedido: 1x Coca-Cola grande
Total: $5,000

✅ ACEPTAR
❌ RECHAZAR
```

**A Pizzalandia**:
```
🎯 NUEVO PEDIDO
Cliente: Juan García
Ubicación: Cra 5, Timbío
Pedido: 1x Pizza Hawaiana mediana
Total: $28,000

✅ ACEPTAR
❌ RECHAZAR
```

**Sistema notifica cliente**:
```
✅ PEDIDOS CONFIRMADOS

Esperando aceptación de comercios...

📍 Don Julio - Hamburguesa ($35,000)
📍 Tienda Don Pepe - Coca-Cola ($5,000)
📍 Pizzalandia - Pizza ($28,000)
```

---

### Paso 8: Aceptación de Comercios

**Todos los comercios aceptan** (supuesto feliz path).

**Sistema actualiza cliente**:
```
🎉 TODOS LOS COMERCIOS ACEPTARON

Se preparan en:
⏱️ Pizzalandia - Listo en 5 min
⏱️ Don Julio - Listo en 12 min
⏱️ Tienda Don Pepe - Listo ahora

🚗 Tu domiciliario está en camino
Nombre: Carlos Rodríguez
Placa: VKX-2034
Vehículo: Moto roja
```

**Estado**: `CONFIRMED → DELIVERY`

---

### Paso 9: Seguimiento en Tiempo Real

**Cliente ve actualizaciones cada 3-5 minutos**:

**Actualización 1** (5 min después):
```
🏪 Pizzalandia: ✅ Pedido listo
🏪 Don Julio: ⏳ Preparando...
🏪 Tienda Don Pepe: ✅ Pedido listo
```

**Actualización 2** (8 min):
```
📍 Carlos está recolectando en Pizzalandia
Distancia a ti: 800 metros
Tiempo estimado: 6 minutos
```

**Actualización 3** (10 min):
```
📍 Carlos está recolectando en Don Julio
Distancia a ti: 400 metros
Tiempo estimado: 4 minutos
```

**Actualización 4** (14 min):
```
📍 Carlos está en Tienda Don Pepe (recolectó última orden)
Distancia a ti: 150 metros
Tiempo estimado: 2 MINUTOS

¡Abre la puerta! 🚪
```

---

### Paso 10: Entrega

**Carlos llega**:
```
📲 Carlos te envía foto de los pedidos

🔐 Código de confirmación:
5847

Escribe el código que te dice Carlos para confirmar.
```

**Cliente ve foto y verifica que todo está correcto**.

**Cliente escribe**: `"5847"`

**Sistema responde**:
```
✅ ENTREGA CONFIRMADA

¡Gracias! ¿Cómo fue tu experiencia?

⭐⭐⭐⭐⭐ (5 estrellas - Excelente)
⭐⭐⭐⭐ (4 estrellas - Bueno)
⭐⭐⭐ (3 estrellas - Normal)
⭐⭐ (2 estrellas - Malo)
⭐ (1 estrella - Muy malo)

Escribe el número.
```

**Cliente califica**: `"5"`

**Sistema responde**:
```
¡Gracias, Juan! 🙏

¿Algo para mejorar? (opcional)
O escribe "LISTO" si todo estuvo bien.
```

**Cliente escribe**: `"Todo perfecto!"`

**Sistema cierra**:
```
¡Excelente! Tus comentarios nos ayudan a mejorar.

🎁 PRÓXIMA COMPRA:
Tienes $3,000 de descuento en tu próximo pedido.
Código: JULIO2024

¿Qué quieres hoy? 😊
```

**Estado**: `DELIVERY → COMPLETED → IDLE`

---

## Flujos Alternativos

### ALT-1: Comercio Rechaza Pedido

**Don Julio no tiene la hamburguesa**:

```
❌ Don Julio rechazó el pedido

Razón: Agoté de pollo hoy

¿Quieres...?
1. Hamburguesa de res de Don Julio ($38,000)
2. Hamburguesa de pollo de Gourmet Burger ($50,000)
3. Cancelar y reembolsar $35,000
4. Esperar si Don Julio repone (no recomendado)

Escribe el número.
```

---

### ALT-2: Cliente No Está en Ubicación

**Carlos llega y cliente no abre**:

```
⚠️ Carlos no encuentra tu puerta

Llamando por WhatsApp...

Si no respondes en 10 minutos, Carlos dejará el pedido en un punto seguro.
```

**Si cliente no contesta**:

```
📦 Carlos dejó los pedidos en el portón (foto adjunta)

Si no es seguro o hay problema:
- Llamar a soporte: +57 3001234567
- Pedir reembolso
```

---

### ALT-3: Cliente Pide Cambio de Ubicación Después de Pagar

```
⚠️ ¿Cambiar ubicación de entrega?

Esto puede agregar tiempo. Nueva estimación: 18 minutos.

¿Confirmar cambio? SÍ / NO
```

---

## Flujos Especiales

### Repeat/Rependir

**Cliente escribe**: `"Lo mismo que la última vez"`

```
📋 Última compra (hace 3 días):
- Hamburguesa de pollo (Don Julio)
- Coca-Cola grande (Don Pepe)
- Pizza Hawaiana (Pizzalandia)

Total: $68,000

¿Repetir? SÍ / CAMBIAR ALGO
```

---

### Búsqueda Ambigua

**Cliente escribe**: `"Dame algo para cenar"`

```
🤔 No estoy seguro qué buscas.

¿Quieres...?
1. 🍕 Comida rápida
2. 🍽️ Restaurante
3. 🍱 Comida casera
4. 🥗 Vegetariano
5. 🌮 Mexicano

Escribe el número.
```

---

## Restricciones y Límites

### Rate Limiting

- Cliente puede hacer máximo 10 búsquedas por hora (evita spam/scraping).
- Sistema responde en máximo 10 segundos.
- Si IA no entiende después de 3 intentos, escalada a humano.

### Horarios

- Sistema funciona 24/7.
- Pero solo muestra comercios dentro de sus horarios.
- Cliente puede programar pedidos para mañana (futuro).

### Geografía

- Cliente debe estar dentro de 5 km del centro de Timbío.
- Si se mueve fuera durante entrega, ésta se cancela.

---

**Propósito**: Documentar cada interacción del cliente con precisión. Esto será la base para el diseño de flujos conversacionales en IA.
