# Roadmap de DomiExpress

## Visión Temporal

```
Hoy (Enero 2024):     MVP en Timbío
Trimestre 1 (Mar 2024): Consolidación
Trimestre 2 (Jun 2024): Expansión a 3 municipios
Trimestre 3 (Sep 2024): Expansión a 10 municipios
Año 2 (2025):           50+ municipios, productos financieros
Año 3+ (2026+):        Consolidación nacional, ecosistema completo
```

---

## Fase 1: MVP Timbío (Enero-Marzo 2024)

### Objetivos

```
✓ Plataforma base funcionando 99.9%
✓ 30+ comercios activos
✓ 100+ domiciliarios entrenados
✓ 2,000+ clientes registrados
✓ 50+ pedidos/día (promedio)
✓ NPS > 60
```

### Entregas

**Backend (NestJS)**:
- [ ] Auth (registro de todos los actores)
- [ ] Gestión de comercios (CRUD + catálogos)
- [ ] Gestión de pedidos (estado machine)
- [ ] Integración Wompi (pagos)
- [ ] Integración WhatsApp Cloud API
- [ ] IA para búsqueda y NLU (Claude API)
- [ ] Notificaciones (push + WhatsApp)
- [ ] Admin panel básico

**Frontend/Chat**:
- [ ] WhatsApp chatbot (flujos conversacionales)
- [ ] Admin dashboard (web simple)

**Infraestructura**:
- [ ] PostgreSQL (Neon.tech)
- [ ] Redis (con BullMQ)
- [ ] Cloudflare R2 (almacenamiento)
- [ ] Monitoring (DataDog)

**Documentación**:
- [x] Visión
- [x] Arquitectura de negocio
- [x] Actores
- [x] Casos de uso
- [x] Flujos (WhatsApp, restaurantes, domiciliarios, pagos)
- [x] Estados de pedido
- [x] Reglas de negocio
- [x] IA
- [ ] Arquitectura técnica (ETAPA 2)
- [ ] Diseño de BD (ETAPA 3)

### Hitos

```
Semana 1-2 (Ene 5-18):   Setup, diseño, bases
Semana 3-4 (Ene 19-Feb 1): Auth, gestión comercios
Semana 5-6 (Feb 2-15):   Pedidos, pagos, IA
Semana 7-8 (Feb 16-29):  WhatsApp, domiciliarios
Semana 9-10 (Mar 1-14):  Testing, QA, bugs
Semana 11-12 (Mar 15-28):Soft launch, feedback
Semana 13 (Mar 29-31):   Ajustes finales, launch
```

### Criterios de Éxito

```
✓ Uptime 99.5% (máximo 3.6 horas downtime/mes)
✓ Latencia <2s en búsqueda (p95)
✓ 0 incidentes de fraude (primeros 50 pedidos)
✓ NPS > 60 (clientes), > 70 (comercios)
✓ Conversion: 40%+ de búsquedas → pedido
```

---

## Fase 2: Consolidación Timbío (Abril-Junio 2024)

### Objetivos

```
✓ 150+ comercios activos
✓ 300+ domiciliarios
✓ 10,000+ clientes
✓ 500+ pedidos/día
✓ $100M+ revenue/mes
✓ NPS > 70
```

### Entregas

**Producto**:
- [ ] Programa de puntos (customer loyalty)
- [ ] Promociones y descuentos
- [ ] Recomendaciones personalizadas
- [ ] Integración POS para comercios
- [ ] Analytics avanzados (comercios)

**Backend**:
- [ ] Sistema de puntos (Redis cache)
- [ ] Notificaciones SMS (futuro)
- [ ] Liquidaciones automáticas mejoradas
- [ ] Auditoría y compliance

**IA**:
- [ ] Fine-tuning de modelo NLU con datos reales
- [ ] Predicción de ETA (XGBoost)
- [ ] Detección de fraude mejorada

**Comercios**:
- [ ] Panel web (comercios pueden ver sales, stats)
- [ ] Integración con sistemas POS

---

## Fase 3: Expansión Regional (Julio-Diciembre 2024)

### Objetivos

```
Municipios:
  ✓ Timbío: 1,000+ pedidos/día (consolidado)
  ✓ Popayán (200,000 hab): Launch
  ✓ Silvia (50,000 hab): Launch
  ✓ 3 municipios más: Preparación

Resultado:
  ✓ 500+ comercios (50+ por municipio)
  ✓ 1,000+ domiciliarios
  ✓ 50,000+ clientes
  ✓ 3,000+ pedidos/día (agregado)
  ✓ $1B+ revenue (agregado)
```

### Entregas

**Infraestructura**:
- [ ] Auto-scaling de servidores
- [ ] CDN global (Cloudflare)
- [ ] Backups diarios (disaster recovery)
- [ ] Load testing (preparar para 10x)

**Producto**:
- [ ] Programa de referidos (clientes, comercios)
- [ ] Soporte multiidioma (español, lenguas locales)
- [ ] Versión ligera (low-bandwidth)

**Comercios**:
- [ ] Integración con contabilidad (SAP, Siigo)
- [ ] Reporte de impuestos automático
- [ ] Financiamiento (adelantos de comisiones)

**Marketing**:
- [ ] Campaña regional
- [ ] Alianzas con municipalidades
- [ ] Program de educación financiera para domiciliarios

---

## Fase 4: Escala Nacional (2025)

### Objetivos

```
Municipios: 50+ en Colombia
  - Cauca (hoy): 8 municipios
  - Antioquia: 10 municipios
  - Eje cafetero: 15 municipios
  - Valle del Cauca: 10 municipios
  - Otros: 10+ municipios

Resultado:
  ✓ 100,000+ comercios
  ✓ 50,000+ domiciliarios
  ✓ 500,000+ clientes
  ✓ 50,000+ pedidos/día
  ✓ $100B+ revenue anual
```

### Entregas

**Ecosistema Financiero**:
- [ ] Crédito para domiciliarios (compra de vehículos)
- [ ] Seguros (accidentes, responsabilidad civil)
- [ ] Billetera digital (DomiYa Pay)
- [ ] Cashback y promociones

**Integraciones**:
- [ ] Plataformas de contabilidad (integración profunda)
- [ ] Bancos (Open Banking)
- [ ] Aseguradoras
- [ ] Proveedores de insumos

**Datos y BI**:
- [ ] Marketplace de datos (precios, tendencias)
- [ ] Reports para comercios (PDF/email)
- [ ] Análisis predictivo (demanda futura)

---

## Fase 5: Consolidación y Ecosistema (2026+)

### Objetivos

```
✓ Plataforma estable en 100+ municipios
✓ Productos financieros generando 20% de ingresos
✓ Marketplace de proveedores activo
✓ LATAM ready (México, Perú, Ecuador)
```

### Entregas

**Nuevas Categorías**:
- [ ] Farmacia (con receta digital)
- [ ] Servicios (reparación, limpieza)
- [ ] Servicios financieros (pagos, transferencias)
- [ ] B2B (venta a comercios mayoristas)

**Automatización**:
- [ ] Robots para almacenes
- [ ] Drones para entregas cortas
- [ ] Automatización de inventario

**Expansión Geográfica**:
- [ ] México (Chiapas)
- [ ] Perú (Cusco, Puno)
- [ ] Ecuador (Sierra)
- [ ] Centroamérica

---

## Timeline Visual

```
2024                   2025                 2026+
│                      │                    │
├─ Q1: MVP Timbío      ├─ Q1-Q2: 50 municipios
│   - 30+ comercios    │   - Productos financieros
│   - 100 domiciliarios│   - Billetera digital
│   - Lanzamiento      │   - Seguros
│                      │
├─ Q2: Consolidación   ├─ Q3-Q4: Escala nacional
│   - 150 comercios    │   - 100+ municipios
│   - NPS > 70         │   - $1B+ revenue
│   - Puntos/loyalty   │   - Preparar Latam
│                      │
├─ Q3-Q4: Expansión    └─ 2026: Ecosistema
│   - 3-5 municipios     - Nuevas categorías
│   - Popayán + Silvia   - Automatización
│   - Preparar nacional  - Expansión LATAM
│
```

---

## No Roadmap (Cosas que NO haremos)

```
❌ App móvil nativa (WhatsApp es suficiente)
❌ Soporte en chat 24/7 (humano)
❌ Envíos internacionales (solo local)
❌ Múltiples idiomas (sí en año 2, no prioritario)
❌ Subscription modelo (pagos por transacción)
❌ Competir con Rappi en ciudades grandes (focus municipios pequeños)
```

---

## Métricas de Progreso

Se revisan cada mes:

```
PRODUCTO:
  - Pedidos/día (target: +15%/mes)
  - Clientes retornistas (target: 60%+)
  - NPS (target: >70)
  - Churn (target: <20%/mes)

NEGOCIO:
  - Revenue (target: +50%/mes)
  - EBITDA margin (target: >40%)
  - Cost per order (target: <$3)
  - Customer LTV (target: $5,000+)

INGENIERÍA:
  - Uptime (target: 99.9%)
  - Latencia p95 (target: <2s)
  - Tasa de error (target: <0.1%)
  - Deploy frequency (target: daily)
```

---

## Decisiones Futuras (TBD)

Estas serán decididas en futuras etapas:

```
❓ ¿Expandir a categoría de viajes (taxis)?
❓ ¿Ofrecer crédito de corto plazo a clientes?
❓ ¿Crear tarjeta de débito (DomiCard)?
❓ ¿Entrar en seguros de salud?
❓ ¿Comprar otros marketplaces locales?
❓ ¿IPO o venta estratégica?
```

---

**Propósito**: Documentar la visión de crecimiento. El roadmap es flexible y ajustable según métricas reales.
