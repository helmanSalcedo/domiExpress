# Gestión de Municipios

## Modelo Multi-Municipio

DomiExpress está diseñado para expandirse a múltiples municipios sin cambiar código.

```
Cada municipio = Instancia independiente + Infraestructura compartida

┌─────────────────────────────────────────┐
│   INFRAESTRUCTURA COMPARTIDA (AWS)       │
│   - DB PostgreSQL                       │
│   - Redis (caché/queues)                │
│   - APIs (IA, Wompi, Maps)              │
│   - Storage (Cloudflare R2)             │
└──────┬──────────┬──────────┬────────────┘
       │          │          │
       ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │Timbío  │ │Popayán │ │Silvia  │
   │(MVP)   │ │(Fase 2)│ │(Fase 2)│
   └────────┘ └────────┘ └────────┘
   (independiente)
```

---

## Definición de Municipio

```json
{
  "id": "MUN-001",
  "name": "Timbío",
  "department": "Cauca",
  "country": "Colombia",
  "population": 12000,
  "center_latitude": 4.7908,
  "center_longitude": -76.1428,
  "coverage_radius_km": 5,
  "timezone": "America/Bogota",
  "currency": "COP",
  "language": "es",
  "whatsapp_number": "+57 3001234567",
  "whatsapp_name": "DomiExpress Timbío",
  "status": "active", // active | paused | closed
  "commission_percentage": 10,
  "max_delivery_distance_km": 10,
  "estimated_delivery_time_minutes": 30,
  "operating_hours": {
    "monday_to_friday": "06:00-23:59",
    "saturday": "06:00-23:59",
    "sunday": "08:00-23:59"
  },
  "active_commerces": 120,
  "active_drivers": 45,
  "registered_customers": 2500,
  "daily_orders": 250,
  "monthly_revenue": 78500000,
  "created_at": "2024-01-01T00:00:00Z",
  "launched_at": "2024-01-15T00:00:00Z"
}
```

---

## Ciclo de Vida de Municipio

### Fase 1: Registro (Sin Clientes)

**Admin crea municipio en panel**:

```
1. Nombre: "Timbío"
2. Ubicación: GPS (4.7908, -76.1428)
3. Radio de cobertura: 5 km
4. Número WhatsApp: +57 3001234567
5. Zona horaria: America/Bogota
6. Comisión: 10%

Status: REGISTERED (no público aún)
```

---

### Fase 2: Preparación (Comercios Piloto)

**Admin invita comercios piloto**:

```
Lista de emails/teléfonos de comercios
  → Sistema envía invitaciones
  → Comercios se registran
  → 20+ comercios confirmados

Status: PREPARATION
  - Clientes pueden ver municipio (read-only)
  - Pero NO pueden hacer pedidos
```

---

### Fase 3: Soft Launch (Beta)

**Admin abre para clientes limitados**:

```
- Comercios: 20+
- Domiciliarios: 10+
- Clientes: Invitados (200-500)

Status: BETA
  - Funciona 100% pero con usuarios limitados
  - Monitoreo intenso
  - Bugs se reportan directamente a admin

Duración: 1-2 semanas
```

---

### Fase 4: Launch (Público)

**Admin publica municipio**:

```
- Anuncio público
- Publicidad en medios locales
- Abierto a todos

Status: ACTIVE
  - Funciona normalmente
  - Metrics en dashboard

Objetivo: Alcanzar 1,000+ pedidos/día en 3 meses
```

---

### Fase 5: Optimización (Crecimiento)

**Después de Launch**:

```
Métricas monitoreadas:
  - Comercios activos (meta: +20/mes)
  - Domiciliarios activos (meta: +5/mes)
  - Clientes retornistas (meta: 60%+)
  - Ordenes/día (meta: +15%/mes)

Acciones:
  - Promover comercios con bajo rating
  - Incentivar domiciliarios en horarios lentos
  - Programas de referidos para clientes
  - Análisis de churn
```

---

### Fase 6: Estabilización o Expansión

**Después de 6 meses**:

```
Opción A: Estabilización
  - Municipio genera ingresos sostenibles
  - Crecimiento natural
  - Prepara expansión a siguiente municipio

Opción B: Cierre
  - Si municipio no es viable (raramente)
  - Ofrecemos alternativas a clientes
  - Liquidamos adeudos a comercios/domiciliarios
```

---

## Datos por Municipio

Cada municipio tiene su propia tabla:

```
Table: municipalities
  - id
  - name
  - department
  - status
  - created_at
  - launched_at

Table: commerces
  - id
  - municipality_id (FK)
  - name
  - category
  - ...

Table: customers
  - id
  - municipality_id (FK)
  - phone
  - ...

Table: drivers
  - id
  - municipality_id (FK)
  - name
  - vehicle_type
  - ...

Table: orders
  - id
  - municipality_id (FK)
  - customer_id
  - commerce_id
  - ...
```

---

## Configuración por Municipio

### Comisión

Cada municipio puede tener comisión diferente:

```
Timbío: 10% (competencia baja)
Popayán: 12% (competencia media)
Silvia: 8% (promos para lanzamiento)
```

**Cambio en vivo**: Si cambias comisión, aplica a nuevas ordenes.

### Horarios

```
Timbío:
  Lunes-Viernes: 6 AM - 11:59 PM
  Sábado-Domingo: 8 AM - 11:59 PM
  
Popayán:
  Lunes-Domingo: 6 AM - 12 AM (medianoche)
```

### Zona de Cobertura

```
Radio fijo desde centro del municipio
  Timbío: 5 km
  Popayán: 7 km (ciudad más grande)

Clientes fuera del rango: No pueden comprar
```

---

## Métricas por Municipio

**Dashboard Admin**:

```
Timbío (15 días activo):
  Comercios: 120 (meta: 150/mes 3)
  Clientes: 2,500 (meta: 5,000/mes 3)
  Domiciliarios: 45 (meta: 100/mes 3)
  
  Ordenes/día: 250 (meta: 1,000/mes 3)
  Revenue/día: $2,625,000 (25 billones/mes)
  
  Retention (7d): 45%
  NPS: +62
  
  Top 5 comercios:
    1. Pizzalandia: $1.2M
    2. Don Julio: $850K
    ...
```

---

## Lanzamiento de Nuevo Municipio

### Checklist

```
PRE-LANZAMIENTO:
  ✓ Municipio registrado en BD
  ✓ WhatsApp numero asignado
  ✓ 20+ comercios invitados
  ✓ Términos legales locales revisados
  ✓ Domiciliarios onboardeados (10+)
  ✓ Equipo de soporte capacitado
  ✓ Métricas baseline definidas

LANZAMIENTO:
  ✓ Municipio status = ACTIVE
  ✓ Anuncio en redes sociales
  ✓ Publicidad local (300,000 COP)
  ✓ Email a comercios
  ✓ Monitor de errores H24

POST-LANZAMIENTO:
  ✓ Daily standup (primeros 7 días)
  ✓ Análisis de churn (día 3, 7, 14)
  ✓ Ajustes basados en feedback
  ✓ Métricas en dashboard
```

---

## Crecimiento de Municipio

### Curva Esperada

```
Mes 1: 0 → 250 pedidos/día
  - Nuevos clientes probando
  - Churn alto (normal)
  - Focus: Estabilidad

Mes 2: 250 → 500 pedidos/día
  - Comercios agregando productos
  - Domiciliarios se especializan
  - Focus: Calidad

Mes 3: 500 → 1,000 pedidos/día
  - Referidos de clientes
  - Entrada de nuevos comercios
  - Focus: Expansión

Mes 4-6: 1,000 → 1,500+ pedidos/día
  - Steady state
  - Rentabilidad confirmada
  - Preparar siguiente municipio
```

---

## Problemas Comunes

### Municipio Crece Lento

```
Síntomas:
  - Pedidos/día < 100 después de 30 días
  - Churn > 70% (clientes no repiten)
  - NPS < 50

Causas posibles:
  1. Pocos comercios (< 20)
  2. Domiciliarios no confiables
  3. Precio de comisión muy alto
  4. Competencia de Rappi
  5. Marketing insuficiente

Acciones:
  1. Reducir comisión temporalmente (8%)
  2. Agregar más comercios (llamadas directas)
  3. Bonus a domiciliarios por calidad
  4. Campaña de referidos agresiva
  5. Soporte directo a clientes (llamadas)
```

### Municipio es Muy Rentable

```
Síntomas:
  - Pedidos/día > 2,000
  - Margin > 50%
  - Waiting time > 45 min

Acciones:
  1. Aumentar comisión 1-2% (si mercado soporta)
  2. Contratar más domiciliarios
  3. Expansión a municipios adyacentes
  4. Introducir productos premium
  5. Alianzas con bancos/seguros
```

---

## Cierre de Municipio (Excepcional)

```
Si municipio NO es viable después de 6 meses:

1. Notificar a todas las partes (30 días antes)
2. Liquidar adeudos:
   - Comercios: Pagar ordenes pendientes
   - Domiciliarios: Liquidación final
   - Clientes: Cancelar suscripciones
3. Transferir datos (historial, calificaciones)
4. Cerrar infraestructura local
5. Oferta a competencia (si aplica)

Status: CLOSED
```

---

**Propósito**: Documentar cómo DomiExpress escala a múltiples municipios manteniendo independencia operacional.
