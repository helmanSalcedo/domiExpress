# Flujo del Domiciliario (DomiYa Driver)

## Contexto

Domiciliarios usan una aplicación simplificada llamada **DomiYa Driver** (puede ser WhatsApp + notificaciones push, o app web ligera).

**Objetivo**: Minimizar fricción. Un motorizado debe aceptar/rechazar pedido en 5 segundos, no en 30.

---

## Ciclo de Vida

### Fase 1: Onboarding

#### Paso 1: Aplicación

**Futuro Domiciliario escribe al WhatsApp de DomiExpress**: `"Quiero ser domiciliario"`

**Sistema responde**:
```
¡Bienvenido a DomiYa! 🚗

Vamos a onboardearte en 10 minutos.

Cuéntame:
1. ¿Cuál es tu nombre completo?
2. ¿Qué vehículo usarás? (Bicicleta/Moto/Carro)
3. ¿Tienes número de cédula?
4. ¿Tienes pasado de referencias?

Empecemos: ¿Tu nombre?
```

**Domiciliario escribe**: `"Carlos Rodriguez García"`

---

#### Paso 2: Información Personal

**Sistema**:
```
¿Cuál es tu número de cédula? (sin espacios)
```

**Domiciliario**: `"1234567890"`

**Sistema**:
```
¿Cuántos años tienes?
```

**Domiciliario**: `"28"`

**Sistema**:
```
¿Tienes teléfono de contacto de emergencia?
```

**Domiciliario**: `"+57 3105555555 (mi hermana)"`

---

#### Paso 3: Vehículo

**Sistema**:
```
¿Qué tipo de vehículo usarás?

1️⃣ Bicicleta
2️⃣ Moto
3️⃣ Carro
4️⃣ Caminando

Escribe el número.
```

**Domiciliario**: `"2"`

**Sistema**:
```
¿Tienes seguro vigente? (Obligatorio para moto)

SÍ / NO

Y si SÍ, ¿hasta qué fecha?
```

**Domiciliario**: `"SÍ, hasta junio 2025"`

**Sistema**:
```
¿Placa del vehículo? (Ej: ABC-123)
```

**Domiciliario**: `"VKX-2034"`

---

#### Paso 4: Validación

**Sistema valida**:
- Cédula: ✅ Válida en BD.
- Edad: ✅ Mayor de 18 años.
- Seguro: ✅ Vigente.

**Sistema**:
```
Genial, Carlos. Tu perfil se ve bien.

Ahora necesitamos una entrevista breve.
¿Cuándo disponible? (Dentro de 24h)

Escribir hora disponible (ej: mañana 2PM)
```

**Domiciliario**: `"Mañana 2PM en Pizzalandia"`

**Sistema**:
```
✅ Entrevista agendada para mañana 14:00 en Pizzalandia.

Recibirás confirmación mañana a las 12:00.

¿Preguntas?
```

---

#### Paso 5: Entrevista (Humano)

**Día siguiente, 2PM**.

**Equipo de soporte** se reúne con Carlos (15 minutos):
- Verifica documento original.
- Prueba seguro.
- Explica reglas.
- Toma foto para identificación.

**Resultado**: ✅ Aprobado.

**Sistema notifica**:
```
✅ APROBADO

Bienvenido a DomiYa, Carlos!

Tu perfil de domiciliario está ACTIVO.

Mañana comenzarás a recibir pedidos.

Descarga la app: https://app.domiexpress.app/driver
O usa WhatsApp + notificaciones push.
```

---

### Fase 2: Trabajar (Turno)

#### Paso 1: Activar Turno

**Carlos abre app DomiYa Driver** (u obtiene link de WhatsApp):

```
🚗 PANEL DE DOMICILIARIO

Estado: INACTIVO

[BOTÓN GRANDE] ACTIVAR TURNO

Horarios disponibles:
- Mañana (10AM-3PM)
- Tarde (2PM-8PM)
- Noche (6PM-12AM)
- Madrugada (11PM-6AM)
```

**Carlos toca "ACTIVAR TURNO"**.

**Sistema valida**:
- ¿Está en Timbío? (GPS)
- ¿Es dentro de horarios permitidos?
- ¿Tiene seguro vigente?
- ¿Están activos pedidos?

**Sistema**:
```
✅ TURNO ACTIVADO

Estás activo en el sistema.
Comenzarás a recibir pedidos en segundos.

📍 Ubicación: Timbío (GPS)
🚗 Vehículo: Moto VKX-2034
⭐ Rating: 4.8/5 (52 entregas)

Espera pedidos...
```

---

#### Paso 2: Recibir Oferta de Pedido

**Un nuevo pedido está listo para entregar**:

**Sistema notifica** (sonido + vibración):

```
🎯 NUEVO PEDIDO
━━━━━━━━━━━━━━━━━━━━
Restaurante: Pizzalandia
Dirección: Cra 5 #4-20 (200 m)
Cliente vive: Cra 5 #3-45 (800 m)
Distancia total: 1 km
Tarifa: $3,500
Pago cliente: Tarjeta (Wompi)
Tipo: Comida

⏱️ ACEPTAR EN: 60 segundos
━━━━━━━━━━━━━━━━━━━━
✅ ACEPTAR
❌ RECHAZAR
```

---

#### Paso 3: Aceptar o Rechazar

**Carlos tiene 60 segundos**.

#### Opción A: Aceptar

**Toca "✅ ACEPTAR"**

**Sistema**:
```
✅ PEDIDO ACEPTADO

Navega a: Pizzalandia, Cra 5 #4-20

[MAPA INTERACTIVO]
👉 Ir a Pizzalandia (8 min en moto)

Domicilio destino: Cra 5 #3-45
```

#### Opción B: Rechazar

**Toca "❌ RECHAZAR"**

**Sistema busca otro domiciliario** (Carlos sin penalización).

```
Pedido rechazado. ¿Razón?

1. Demasiado lejos
2. No tengo tiempo
3. Otro

(Optional - no obligatorio reportar)

Esperando siguiente pedido...
```

---

#### Paso 4: Navegar a Comercio

**Carlos en moto, sigue Google Maps** integrado.

**ETA a Pizzalandia: 7 minutos**.

**Sistema actualiza cliente**:
```
🚗 Tu domiciliario está en camino
Nombre: Carlos Rodríguez
Placa: VKX-2034
ETA: 7 minutos

Ver mapa: [Link]
```

---

#### Paso 5: Llegar a Comercio

**Carlos llega a Pizzalandia**.

**Sistema notifica a Carlos**:
```
✅ LLEGASTE A PIZZALANDIA

Busca con los vendedores el pedido con PIN: 5847

O muestra esta pantalla para que lo escaneen.
```

**Dueño de Pizzalandia ve a Carlos**, le muestra el código QR (si existe) o dice "5847".

**Carlos toca "RECOLECTAR"** en la app.

**Sistema**:
```
✅ PEDIDO RECOLECTADO

Ahora navega a:
Cra 5 #3-45, Timbío (cliente Juan García)

ETA: 5 minutos

📍 Comparte ubicación en tiempo real (automático durante entrega)
```

---

#### Paso 6: En Camino al Cliente

**Carlos navega**.

**Sistema actualiza cliente cada 3 minutos**:

**Min 0**:
```
🚗 Carlos está recolectando en Pizzalandia
ETA: 5 minutos
```

**Min 3**:
```
🚗 Carlos está en camino
ETA: 2 minutos
```

**Min 4**:
```
🚗 Carlos está a 1 cuadra
¡Abre la puerta! 🚪
```

---

#### Paso 7: Llegar a Cliente

**Carlos llega a ubicación del cliente**.

**Sistema en app de Carlos**:
```
✅ LLEGASTE AL CLIENTE

👤 Cliente: Juan García
📍 Cra 5 #3-45

Toma foto del pedido (frente a cliente si es posible).
```

**Carlos toma foto** (obligatorio para auditoría).

**Sistema**:
```
Código de confirmación: 5847

Dale el PIN al cliente para que lo confirme.

O llama al cliente si no sale.
```

**Carlos toca timbre / llama**.

**Cliente abre puerta**.

**Carlos muestra foto del pedido y dice "PIN 5847"**.

**Cliente verifica que se ve bien**.

**Cliente escribe en su WhatsApp el PIN: "5847"**.

**Sistema en WhatsApp del cliente valida**:
```
✅ CÓDIGO CONFIRMADO

Entrega exitosa. Gracias!

¿Calificación? ⭐⭐⭐⭐⭐
```

---

#### Paso 8: Confirmación en App de Carlos

**Sistema en app de Carlos**:
```
✅ ENTREGA CONFIRMADA

PIN validado por cliente.
Pago: $3,500 💵

Tu saldo: $24,500 (hoy)

¿Siguiente pedido?

[BOTÓN] SIGUIENTE PEDIDO
```

---

## Flujos Alternativos

### ALT-1: Cliente No Está

**Carlos llega, toca timbre, nadie responde** (después de 2 intentos).

**Sistema**:
```
⚠️ Cliente no responde

Intenta llamar por WhatsApp...
```

**Carlos llama por WhatsApp** (sistema hace click automático).

**Cliente contesta**:
```
Perdón! Estoy bajando. Espera 2 minutos.
```

**Carlos espera**.

---

### ALT-2: Cliente No Quiere Pagar

**Cliente ve el pedido y dice "Esto cuesta más de lo que pagué"**.

**Costo real: $70,000 (había error de entrada)**.
**Cliente pagó: $68,000**.

**Carlos en app**:
```
⚠️ Cliente reporta discrepancia de precio

Diferencia: +$2,000

Opciones:
1️⃣ Cliente paga $2,000 extra (Wompi)
2️⃣ Devolver pedido a comercio
3️⃣ Llamar a soporte

¿Qué hacer?
```

**Carlos toca "LLAMAR A SOPORTE"**.

**Soporte humano llama** en máximo 5 minutos.

**Soporte verifica**:
- Precio en sistema: $70,000 ✅
- Precio pagado: $68,000 ❌

**Soporte al cliente**:
"Hubo un error. Dos opciones: pagá $2,000 extra o devolvemos el pedido."

**Cliente decide: Pagar extra**.

**Carlos completa entrega**.

---

### ALT-3: Accidente / Lesión

**Carlos tiene un accidente en moto**.

**Carlos toca en app**:
```
🚨 EMERGENCIA / ACCIDENTE

Reportar accidente...

¿Estás bien?
```

**Sistema**:
- Notifica a equipo de soporte inmediatamente.
- Contacta al número de emergencia de Carlos.
- Suspende pedido (no hay penalización para Carlos).
- Notifica cliente: "Tu entrega se verá afectada. Soporte te contactará."
- Verifica seguro de Carlos (si está vigente, se cubre).

---

### ALT-4: Rechazo de Producto

**Cliente rechaza pedido**:
"El pedido llegó quemado".

**Cliente en WhatsApp**:
```
CANCELAR ENTREGA

Razón: Producto quemado (foto adjunta)
```

**Sistema**:
- Notifica a Carlos: "Cliente rechaza pedido."
- Carlos devuelve a Pizzalandia.
- Pizzalandia reembolsa $68,000 al cliente.
- Carlos recibe comisión (completó parte de la entrega).

---

## Reglas para Domiciliarios

### Límites

- **Aceptación**: 60 segundos máximo.
- **Rechazo**: Máximo 3 rechazos por turno sin penalización. Después, se reduce frecuencia de ofertas.
- **No-show**: Si aceptas y no llegas en 20 minutos, se cancela y se investiga.

### Ingresos

- **Base**: $3,500 por entrega.
- **Bonus**: +20% si entregas en tiempo (dentro de ETA estimada).
- **Penalización**: -$500 si llegas tarde (>ETA + 15 min).

### Seguridad

- **Ubicación**: Se captura cada 15 segundos durante entrega (seguridad para ambos).
- **Foto**: Obligatoria (auditoría contra fraude).
- **PIN**: Obligatorio (evita entregas sin confirmación).
- **Seguro**: Cubre accidentes, lesiones, robos.

### Suspensión

Domiciliario se suspende si:
- Rating cae <3.5/5.
- Rechaza >50% de pedidos en una semana.
- Hay reporte de robo/violencia.
- No actualiza datos de seguro.

---

## Incentivos

### Programa de Ramificación

```
NIVEL 1: 0-50 entregas
- Paga base: $3,500/entrega
- Bonus tiempo: +20%

NIVEL 2: 51-200 entregas
- Paga base: $3,750/entrega
- Bonus tiempo: +25%
- Bonus consistencia: +$50 por 10 entregas sin rechazos

NIVEL 3: 201+ entregas
- Paga base: $4,000/entrega
- Bonus tiempo: +30%
- Bonus consistencia: +$100 por 10 entregas
- Acceso a 'Pedidos VIP' (clientes premium, mayor pago)
```

### Promotions

- **Día muy ocupado** (>500 pedidos en el municipio):
  - Multiplicador de 1.5x durante horas pico (10AM-12PM, 7PM-9PM).
  
- **Meta semanal**:
  - Si completas 100+ entregas en 7 días: Bonus de $50,000.

---

## Dashboard del Domiciliario

App o web: `https://driver.domiexpress.app`

Pueden ver:
- **Hoy**: Entregas completadas, ingresos.
- **Esta semana**: Total de dinero.
- **Este mes**: Gráfico de tendencias.
- **Rating**: 4.8/5, comentarios.
- **Documentación**: Seguro, cédula, estado de vigencia.
- **Liquidaciones**: Historial de pagos.

---

## Métodos de Pago

### Diario

- Dinero se acredita cada 24 horas.
- Opción: Transferencia bancaria automática.

### Semanal

- Retiro a través de cajero (futura integración con banco).

---

**Propósito**: Documentar experiencia de domiciliario. Debe ser tan simple que alguien sin educación formal pueda usarla, y tan segura que se protejan ambas partes.
