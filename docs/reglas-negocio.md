# Reglas de Negocio

## Validación de Ordenes

### Validación de Cliente

```
✓ Cliente está registrado
✓ Cliente tiene teléfono confirmado
✓ Cliente está dentro de cobertura geográfica
✓ Cliente no está suspendido
✓ Cliente tiene método de pago válido (para pago online)
```

### Validación de Productos

```
✓ Producto existe en catálogo
✓ Producto está en stock (no agotado)
✓ Producto está activo (no descontinuado)
✓ Precio es válido (dentro de rango histórico ±30%)
✓ Personalización es válida (si aplica)
```

**Regla de Precio**: Si precio cambió >30% desde última búsqueda, avisar cliente:
```
"Este producto costaba $40,000, ahora cuesta $52,000. ¿Proceders?"
```

### Validación de Comercio

```
✓ Comercio está activo (no suspendido)
✓ Comercio está dentro de horario operacional
✓ Comercio está dentro de cobertura geográfica
✓ Comercio tiene capacidad (máximo pedidos simultáneos)
✓ Comercio tiene método de pago para recibir dinero
```

**Capacidad**: Cada comercio tiene límite de pedidos simultáneos:
- Tienda pequeña: 5 máximo.
- Restaurante pequeño: 10 máximo.
- Restaurante grande: 30+ máximo.

Si se alcanza límite, pedido entra en cola y se ofrece ETA más larga.

### Validación de Domiciliario

```
✓ Domiciliario está activo
✓ Domiciliario está dentro de rango de cobertura
✓ Domiciliario tiene rating >= 3.5 (mínimo)
✓ Domiciliario tiene seguro vigente (si aplica)
✓ Domiciliario no está en turno previo (máx 2 entregas simultáneas)
```

---

## Limites y Cuotas

### Por Cliente

| Métrica | Límite | Razón |
|---------|--------|-------|
| Búsquedas/hora | 10 | Evitar scraping |
| Pedidos/hora | 3 | Evitar spam |
| Monto máximo/pedido | $5,000,000 | Fraude |
| Monto máximo/día | $50,000,000 | Fraude |
| Rechazos antes de suspensión | 5/día | Abuso |

### Por Comercio

| Métrica | Límite | Razón |
|---------|--------|-------|
| Rechazos sin penalización | 3/hora | Normal |
| Rechazos antes de investigación | 5/hora | Antifraude |
| Cambios de precio/día | 10 | Evitar volatilidad |
| Cambios de catálogo/día | 3 | Estabilidad |
| Caída de rating antes de suspensión | <3.5 | Calidad |

### Por Domiciliario

| Métrica | Límite | Razón |
|---------|--------|-------|
| Entregas simultáneas | 2 | Seguridad |
| Rechazos sin penalización | 3/turno | Normal |
| Rating mínimo | 3.5 | Calidad |
| Infracciones antes de suspensión | 3/mes | Seguridad |

### Por Municipio

| Métrica | Límite | Notas |
|---------|--------|-------|
| Comercios activos | Sin límite | Escalable |
| Domiciliarios activos | Dinámico | Según demanda |
| Pedidos/día | Sin límite | Capacidad infra |
| Uptime | 99.9% | SLA crítico |

---

## Aceptación y Rechazo

### Aceptación de Pedido (Comercio)

**Regla 1: Timeout**
```
Si comercio no responde en 60 segundos:
  - Pedido se considera RECHAZADO
  - Se asigna a siguiente comercio
  - Comercio recibe notificación de incumplimiento
```

**Regla 2: Rechazo Frecuente**
```
Si comercio rechaza 3+ pedidos en 1 hora:
  - Investigación automática
  - Si patrón confirmado:
    - Advertencia
    - -20 puntos de confiabilidad
    - Si baja de 60: Suspensión temporal
```

**Regla 3: Aceptación Retroactiva**
```
NO se permite "aceptar después de rechazar"
Si comercio rechaza, no puede volver atrás
Debe esperar siguiente pedido
```

---

## Personalización de Productos

### Reglas

```
✓ Personalizaciones deben ser razonables
  - "Sin tomate" OK
  - "Triple cantidad de queso" OK
  - "Cambiar ingrediente por X" OK (si existe alternativa)
  
✗ NO permitidas:
  - Cambios que reconfiguran completamente el producto
  - Solicitudes que violan alergias (ej: "Añade nueces" si es alérgeno)
  - Cambios que incrementan costo >25%
```

### Costo de Personalización

```
- Personalización básica (quitar ingrediente): Sin costo
- Personalización media (cambiar tamaño): +20%
- Personalización mayor (agregar ingredientes premium): +50% máximo
```

### Comunicación

```
Personalizaciones se envían como texto libre al comercio:
"1x Hamburguesa de pollo sin tomate, mucho queso, cheddar extra"
```

No hay sistema de "opciones" pre-definidas. IA entiende contexto.

---

## Devoluciones y Disputas

### Ventana de Disputa

```
- Disputa debe abrirse dentro de 24 horas de COMPLETED
- Después de 24 horas: No se acepta disputa (dinero liberado)
- Excepción: Fraude probado (cualquier tiempo)
```

### Razones Válidas de Disputa

| Razón | Prueba Requerida | Veredicto Típico |
|-------|-----------------|------------------|
| Producto no llegó | Foto de entrega + ubicación | Reembolso cliente |
| Producto dañado | Foto del producto | Reembolso cliente |
| Producto incorrecto | Descripción + foto | Reembolso cliente |
| Precio incorrecto | Captura de pantalla | Depende |
| No fue entregado | Domiciliario sin confirmación | Reembolso cliente |

### Veredicto de Disputa

**Admin revisa**:
1. Foto de entrega (existe?).
2. Historial del comercio (tiene problemas previos?).
3. Historial del cliente (hace muchas disputas?).
4. Contexto (fue día ocupado, error comprensible?).

**Decisión**:
```
FAVOR CLIENTE (70% de casos):
  - Reembolso al cliente
  - Comisión NO se cobra a comercio
  - Domiciliario mantiene comisión
  - Comercio recibe -10 puntos confianza
  
FAVOR COMERCIO (25% de casos):
  - Dinero se libera a comercio
  - Cliente no recibe reembolso
  - Cliente recibe -1 punto confianza (antifraude)
  
PENDIENTE (5% de casos):
  - Ambas partes deben proveer más evidencia
  - Admin revisa nuevamente en 48h
```

### Límite de Disputas

```
Cliente con 3+ disputas por mes:
  - Investigación automática
  - Posible patrón de fraude
  - Si confirmado: Suspensión de cuenta
```

---

## Comisiones y Tarifas

### Comisión Base (10%)

```
Cliente paga: $100,000
Comisión: $10,000 (10%)
Comercio recibe: $90,000

Excepciones:
- Efectivo pagado al domiciliario: 0% comisión
  (Cliente paga cash, comercio recibe 100%)
```

### Comisión Dinámicamente Ajustable

**Por municipio** (configurable por admin):
```
Timbío: 10%
Popayán: 12%
Silvia: 8%
```

**Por comercio** (penalizaciones):
```
Comercio con 2+ disputas/mes:
  - Comisión: +2% (de 10% a 12%)
  
Comercio nuevo (<100 ordenes):
  - Comisión: -2% (de 10% a 8%, promo)
  
Comercio con rating <3.8:
  - Comisión: +1% (sanción)
```

### Descuentos por Volumen

**No hay** descuentos por volumen. Todos pagan 10% base.

(Esto simplifica billing y evita manipulación de precios.)

---

## Horarios y Disponibilidad

### Horario del Comercio

```
El sistema SOLAMENTE muestra comercios dentro de horario:

Si comercio dice "10AM-10PM":
- 9:59 AM: NO aparece
- 10:00 AM: Aparece
- 9:59 PM: Aparece
- 10:00 PM: NO aparece
```

**Excepción**: Si pedido se coloca antes de cierre, se acepta.
```
Cliente pone pedido a las 9:58 PM
Comercio cierra a 10:00 PM
→ Pedido es válido
→ Comercio tiene 2 minutos para aceptar
```

### Horario del Municipio

```
El sistema completo está disponible 24/7
Pero cada municipio puede tener "horarios de funcionamiento":

Ejemplo:
- Lunes-viernes: 6 AM - 12 AM (medianoche)
- Fines de semana: 6 AM - 2 AM

Fuera de horario:
  - NO se pueden hacer nuevos pedidos
  - Pero se pueden ver categorías/precios
  - Se muestra: "Sistema abre a las 6 AM"
```

---

## Ubicación y Cobertura

### Radio de Cobertura

```
Centro del municipio (GPS fijo):
  - Timbío: 4.79° N, 76.14° W
  - Radio de cobertura: 5 km

Cliente:
  - Debe estar dentro de 5 km del centro
  - Valido en tiempo de pedido Y en tiempo de entrega
  - Si se mueve fuera: Pedido se cancela

Comercio:
  - Debe estar dentro de 5 km
  - Si se registra fuera: Rechazado

Domiciliario:
  - Debe estar dentro de 5 km cuando activa turno
  - Si se mueve fuera: Se pausa el turno
```

### Validación de Ubicación

```
1. Cliente comparte ubicación (WhatsApp GPS)
2. Backend valida:
   - ¿Está dentro de cobertura? (distancia <= 5 km)
   - ¿Es realista? (no cambió 100 km en 5 segundos)
   - ¿No es spoofed? (validación de inconsistencias)
3. Si válida: Acepta
4. Si inválida: "Tu ubicación no es válida. Intenta de nuevo."
```

---

## Seguridad y Fraude

### Detección de Fraude

**Nivel 1: Automático (Sistema)**
```
- Tarjeta rechazada por banco
- IP sospechosa (múltiples países en 1 hora)
- Monto anómalo (10x promedio de cliente)
- Geolocalización sospechosa (saltos imposibles)
→ Acción: Pedir 2FA o rechazar
```

**Nivel 2: Antifraude (Wompi)**
```
- Wompi tiene score interno
- Si score <50: Transacción rechazada
→ No pasa al backend
```

**Nivel 3: Investigación (Admin)**
```
- Patrón de muchas disputas
- Comercio con muchos rechazos
- Domiciliario con muchos accidentes reportados
→ Acción: Revisión manual + suspensión si es necesario
```

### Fraude Conocido

**Tipo 1: Cargo Doble**
```
Cliente intenta pagar 2 veces mismo pedido
→ Sistema valida: "Este pedido ya fue pagado"
→ Rechaza automáticamente
```

**Tipo 2: Pago sin Entrega**
```
Domiciliario rechaza sin válida razón
Cliente disputa
→ Dinero va a cliente si no hay foto de entrega
```

**Tipo 3: Comercio Fantasma**
```
Comercio registra 50 pedidos pero nunca aparece
Todos reciben 1 estrella
→ Admin suspende y investiga
```

---

## Cumplimiento Legal

### Datos Personales (GDPR-like)

```
Cliente es dueño de sus datos
- Nombre, teléfono, ubicación: Necesarios
- Email: Opcional
- Método de pago: Custodiado por Wompi (no guardamos)

Derecho de acceso: "Descargar mis datos"
Derecho de olvido: "Eliminar mi cuenta"
Derecho de oposición: "No quiero promociones"
```

### Menores de Edad

```
Cliente <18 años:
- Requiere consentimiento de tutor
- No puede hacer pedidos sin verificación
- Máximo $500,000 por pedido
```

### Transacciones de Efectivo

```
Domiciliario maneja dinero en efectivo
→ Debe tener seguro vigente
→ Tiene derecho a negarse si dinero >$1,000,000
→ Puede solicitar desglose de cambio
```

---

## Escalación

### Cadena de Escalación

```
NIVEL 1: Chatbot IA (responde 80% de consultas)
  ↓ (Si IA no puede)
NIVEL 2: Soporte Humano (Chat/WhatsApp)
  ↓ (Si necesita decisión)
NIVEL 3: Supervisor (Puede aprobar acciones)
  ↓ (Si es legal/fraude)
NIVEL 4: Admin/Abogado (Decisión final)
```

### Tiempos de Respuesta

| Nivel | Tipo | Tiempo |
|-------|------|--------|
| L1 (IA) | Inmediato | <10s |
| L2 (Humano) | Urgente | <5min |
| L2 (Humano) | Normal | <1h |
| L3 (Supervisor) | Normal | <4h |
| L4 (Admin) | Legal | <24h |

---

## Auditoría

### Datos Auditados

```
CRÍTICOS (7 años retención):
- Todas las transacciones de dinero
- Todos los pesos (pagos a comercios/domiciliarios)
- Todas las disputas
- Todas las suspensiones

IMPORTANTES (1 año retención):
- Logs de pedidos
- Datos de ubicación
- Interacciones de chat

TEMPORALES (30 días):
- Logs de sistema
- Errores de aplicación
```

### Acceso a Auditoría

```
Admin: Acceso completo
Contador: Solo transacciones financieras
Abogado: Solo disputas y suspensiones
Datadog: Logs de error anónimos
```

---

**Propósito**: Documentar las "leyes" que rigen el sistema. Backend debe enforcer estas reglas en código.
