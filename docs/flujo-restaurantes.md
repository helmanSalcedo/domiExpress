# Flujo del Comercio por WhatsApp

## Contexto

El comercio recibe pedidos, los gestiona y coordina con domiciliarios, todo por WhatsApp. No accede a un panel web (a menos que lo quiera).

**Número dedicado**: Cada comercio tiene su propio WhatsApp (ej: +57 3101234567).

## Estados del Comercio

```
REGISTERED (Registrado)
  ↓
ACTIVE (Recibiendo pedidos)
  ↓
RESPONDING (Procesando pedido)
  ↓
CONFIRMED (Aceptado)
  ↓
READY (Listo para recoger)
  ↓
IN_PICKUP (Domiciliario recolectando)
  ↓
COMPLETED (Entregado)
```

---

## Flujo Completo: Desde Registro hasta Primer Pedido

### Paso 1: Dueño Inicia Registro

**Dueño escribe al WhatsApp de DomiExpress**: `"Registrar mi comercio"`

**Sistema responde**:
```
¡Bienvenido a DomiExpress! 🚀

Voy a registrar tu negocio en 5 minutos.

¿Cuál es el nombre de tu comercio?
```

---

### Paso 2: Datos Básicos

**Dueño escribe**: `"Pizzalandia"`

**Sistema**: `"¿Qué categoría? (Restaurante, Tienda, Supermercado, etc.)"`

**Dueño escribe**: `"Restaurante"`

**Sistema**: `"¿Cuál es el número de WhatsApp ÚNICO de tu comercio? (para recibir pedidos)"`

**Dueño escribe**: `"+57 3101234500"`

**Sistema valida**: ✅ Número no registrado.

```
¿Cuál es la dirección del local? (Calle, número, barrio)
```

**Dueño escribe**: `"Cra 5 #4-20, Timbío"`

**Sistema**: `"Perfecto. Comparte la ubicación GPS del local."`

**Dueño comparte ubicación**.

**Sistema valida**: ✅ Dentro de cobertura de Timbío.

---

### Paso 3: Horarios

**Sistema**: `"¿En qué horario operas? (ej: 10AM-10PM)"`

**Dueño escribe**: `"10AM-10PM lunes a viernes, 10AM-12AM fines de semana"`

**Sistema**:
```
Horarios confirmados:
- Lunes a viernes: 10 AM - 10 PM
- Sábados y domingos: 10 AM - 12 AM

¿Cambiar? SÍ / NO
```

**Dueño escribe**: `"NO"`

---

### Paso 4: Fotos y Catálogo

**Sistema**: `"Comparte la foto del local o logo de tu negocio."`

**Dueño comparte foto**.

**Sistema**: `"¡Perfecto! Ahora el catálogo (la más importante)."`

**Sistema presenta opciones**:
```
¿Cómo quieres compartir tu menú?

1️⃣ PDF (si tienes un archivo)
2️⃣ Fotos (si tienes fotos de productos)
3️⃣ Escribir (si lo haces manual)

Escribe el número.
```

**Dueño escribe**: `"1"`

**Sistema**: `"Sube el PDF de tu menú."`

**Dueño comparte PDF de menú** (5 MB máximo).

---

### Paso 5: Procesamiento Automático con IA

**Sistema procesa PDF**:
```
⏳ Analizando tu catálogo...
(15-30 segundos)
```

**IA extrae**:
- OCR del PDF.
- Identifica categorías (Pizzas, Bebidas, Postres).
- Identifica productos y precios.
- Identifica ingredientes cuando existan.
- Detecta variantes (tamaños).

**Sistema responde**:
```
✅ CATÁLOGO PROCESADO

Detecté 28 productos en 4 categorías:

📂 PIZZAS (10 productos)
   - Margherita $25,000
   - Hawaiana $28,000
   - Carnes $32,000
   - Vegana $26,000
   ...

📂 BEBIDAS (5 productos)
   - Gaseosa pequeña $3,000
   - Gaseosa grande $5,000
   ...

📂 POSTRES (8 productos)
   ...

📂 OTROS (5 productos)
   ...

¿Se ve correcto? SÍ / NO / CORREGIR
```

---

### Paso 6: Validación y Correcciones

**Dueño revisa y ve errores**:

**Dueño escribe**: `"CORREGIR"`

**Sistema**: `"¿Qué cambio necesitas?"`

**Dueño escribe**: 
```
1. La Hawaiana no lleva piña, es con piña + jamón opcional
2. Agregar tamaño (Pequeña 20cm, Mediana 30cm, Grande 40cm)
3. Agregar categoría COMBOS
```

**Sistema actualiza**:
```
✅ CORREGIDAS PIZZAS:
- Hawaiana: Incluye jamón + piña opcional (+$2,000)

✅ AGREGADOS TAMAÑOS:
- Mediana: Multiplicador x1.2 ($33,600)
- Grande: Multiplicador x1.5 ($42,000)
- Pequeña: Multiplicador x0.8 ($22,400)

¿Falta algo? O escribe "LISTO"
```

**Dueño escribe**: `"LISTO"`

---

### Paso 7: Métodos de Pago

**Sistema**:
```
¿Qué métodos de pago aceptas?

1️⃣ Tarjeta de crédito (Wompi)
2️⃣ Efectivo (cliente paga al domiciliario)
3️⃣ Ambos

Escribe el número.
```

**Dueño escribe**: `"3"`

```
✅ Aceptarás tarjeta de crédito Y efectivo.
```

---

### Paso 8: Comisión

**Sistema**:
```
📊 MODELO DE COMISIÓN

Por cada pedido que proceses:
- Cliente paga: $100,000 (ejemplo)
- Comisión DomiExpress: 10% ($10,000)
- Tú recibes: $90,000
- Domiciliario: $3,500 (de nuestra comisión)

¿Aceptas estos términos? SÍ / NO
```

**Dueño escribe**: `"SÍ"`

---

### Paso 9: Comercio PUBLICADO

**Sistema**:
```
🎉 ¡PIZZALANDIA ESTÁ PUBLICADO!

Tu comercio ya está visible en la plataforma.

Recibirás notificaciones en este WhatsApp: +57 3101234500

📊 Panel de comercio:
https://comercios.domiexpress.app/dashboard/pizzalandia

Ahí puedes ver:
- Pedidos
- Ventas
- Reportes
- Gestión de inventario (futuro)

¿Preguntas? Escribe "SOPORTE"
```

---

## Flujo: Recibir y Gestionar Pedido

### Paso 1: Notificación de Nuevo Pedido

**Comercio recibe notificación** (push en WhatsApp):

```
🎯 NUEVO PEDIDO #12345
━━━━━━━━━━━━━━━━━━━━
👤 Cliente: Juan García
📍 Ubicación: Cra 5 #3-45, Timbío (1.2 km)
⏱️ Tiempo de preparación solicitado: 15 min
📱 Teléfono del cliente: +57 3101111111

📋 PEDIDO:
   1x Pizza Hawaiana Mediana
   1x Coca-Cola grande
   
💵 TOTAL: $68,000

━━━━━━━━━━━━━━━━━━━━
✅ ACEPTAR
❌ RECHAZAR
━━━━━━━━━━━━━━━━━━━━
```

---

### Paso 2: Decisión del Comercio

#### Opción A: Aceptar

**Dueño toca "✅ ACEPTAR"**

**Sistema responde**:
```
✅ PEDIDO ACEPTADO

Cliente ha sido notificado.

⏱️ TU TIEMPO: 15 minutos

El pedido está en la cocina. Cuando esté listo, escribe "LISTO" o envía foto.
```

#### Opción B: Rechazar

**Dueño toca "❌ RECHAZAR"**

**Sistema pregunta**:
```
❌ ¿Por qué rechazas?

1. Producto agotado
2. No tengo ingredientes
3. Cocina llena, muy ocupado
4. Otro (especificar)

Escribe el número.
```

**Dueño escribe**: `"1"`

**Sistema actualiza**:
```
✅ RECHAZADO

Razón enviada al cliente: "Agoté Pizza Hawaiana"

Se sugieren alternativas:
- Pizza Margherita de otro restaurante
- Pizza Hawaiana con pimiento extra

El cliente puede proceder o cambiar.
```

---

### Paso 3: Preparación y Confirmación de Listo

**Dueño prepara pedido**.

**Dueño escribe**: `"LISTO"` (después de 12 minutos)

**Sistema responde**:
```
✅ PEDIDO LISTO

Domiciliario en camino (Carlos Rodríguez, placa VKX-2034)
ETA: 5 minutos

Genera código de recepción:
PIN: 5847
```

**Sistema genera QR** (código visual para escanear):
```
[QR CODE]
5847 - PIZZALANDIA
```

---

### Paso 4: Domiciliario Llega y Recoge

**Carlos (domiciliario) llega** a Pizzalandia.

**Sistema notifica comercio**:
```
🚗 Carlos está aquí (Placa: VKX-2034)

Muéstrale el PIN: 5847

Él escanea el QR o lo escribe en su app.
```

**Carlos escanea QR o digita PIN**.

**Sistema confirma**:
```
✅ RECOLECCIÓN CONFIRMADA

Carlos tiene el pedido. Entregará en ~8 minutos.
```

---

### Paso 5: Comercio Ve Entrega en Tiempo Real (Opcional)

**Dueño puede ver en panel**:
- Ubicación de Carlos (mapa general).
- ETA de llegada del cliente.
- Si el cliente calificó bien.

---

## Flujos Alternativos

### ALT-1: Cambiar Precio Después de Aceptar

**Dueño descubre que un producto cuesta más**.

**Dueño escribe**: `"Cambiar precio Pizza Hawaiana a $30,000"`

**Sistema**: `"⚠️ El cliente ya pagó $28,000. ¿Cambiar solo para futuros pedidos? SÍ / NO"`

**Dueño escribe**: `"SÍ"`

```
✅ Precio actualizado solo para nuevos pedidos.
```

---

### ALT-2: Pedir Más Tiempo

**Dueño se retrasa**.

**Dueño escribe**: `"Necesito 5 minutos más"`

**Sistema notifica cliente**:
```
⏳ El restaurante necesita 5 minutos más.
Nueva ETA: 18 minutos.

¿Está bien? SÍ / CANCELAR
```

---

### ALT-3: Comercio Necesita Cambiar Horarios

**Es festivo y cierra temprano**.

**Dueño escribe**: `"Hoy cierro a las 4PM"`

**Sistema actualiza instantáneamente**:
```
✅ Horario actualizado para hoy.

Después de las 4PM, no aparecerás en búsquedas.
Mañana vuelves a horario normal.
```

---

### ALT-4: Problema con Cliente

**Cliente insiste en pizza quemada**.

**Dueño escribe**: `"SOPORTE: Cliente reclama pizza quemada"`

**Sistema**:
```
⚠️ ESCALADA A SOPORTE

Tu caso ha sido escalado.

Esperando respuesta de equipo de soporte...
```

**Soporte interno investiga**:
- Revisa foto de entrega.
- Lee calificación del cliente.
- Decide reembolso o reposición.

---

## Reglas para Comercios

### Límites

- **Aceptación**: Máximo 60 segundos para responder.
- **Rechazo**: Si rechazas >3 pedidos por hora activa, se investiga.
- **Mentira en catálogo**: Si mientes (producto no existe), suspensión.

### Comisión

- La comisión es **del valor total**, incluyendo extras.
- **No hay comisión sobre efectivo** (cliente paga al domiciliario, no se toca).
- Se liquida cada 24 horas.

### Datos del Cliente

- Comercio recibe: Nombre, teléfono, ubicación.
- Comercio NO recibe: Email, métodos de pago (privacidad).
- Comercio es dueño de sus contactos (puede marketing, pero no vender a terceros).

### Suspensión

Comercio se suspende si:
- Vende productos ilegales.
- Cobra fuera de plataforma.
- Abusa de clientes (comentarios negativos consistentes).
- Viola horarios frecuentemente.

---

## Panel Web (Opcional)

Comercio que quiera acceso a web puede usar:
```
https://comercios.domiexpress.app/pizzalandia
```

Acceso:
- Dashboard de pedidos.
- Reportes de ventas.
- Gestión de inventario (futuro).
- Analytics.
- Facturación.

Pero no es obligatorio. Puede hacer todo por WhatsApp.

---

**Propósito**: Documentar cómo el comercio interactúa con la plataforma. Debe ser tan simple que un vendedor de tienda de barrio sin educación formal pueda usarla sin problemas.
