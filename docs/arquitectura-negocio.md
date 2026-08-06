# Arquitectura del Negocio

## Modelo de Ingresos

### 1. Comisión por Transacción (Principal)

**Porcentaje**: 8-15% del valor del pedido (configurable por municipio)

**Quién paga**: El cliente paga el 100% al comercio. DomiExpress retiene su comisión.

**Justificación**:
- Similar a Rappi/Uber Eats pero más justo.
- Escalable naturalmente (a más pedidos, más ingresos).
- Alineado con el crecimiento del comercio.

**Desglose típico** (pedido de $100,000):
- Cliente paga: $100,000
- Comisión DomiExpress: $10,000 (10%)
- Comercio recibe: $90,000
- Domiciliario: Incluido en comisión DomiExpress

### 2. Fee de Domiciliario (Subsidiado por Comisión)

**Costo**: $2,000-5,000 COP por pedido

**Quién paga**: DomiExpress (no el cliente ni el comercio)

**Justificación**:
- No queremos fricción en el checkout.
- Domiciliarios necesitan ingresos garantizados.
- La comisión del 10% es suficiente para cubrir esto.

**Cálculo**:
- Comisión recibida: $10,000
- Domiciliario: $3,500
- Operaciones/Infraestructura: $4,000
- Ganancia: $2,500 (25% margen)

### 3. Servicios Premium (Futuro)

**Candidatos**:
- **Anuncios destacados**: Comercios pagan $5,000-20,000/mes para aparecer primero.
- **Analytics avanzados**: Informes detallados: $10,000/mes.
- **Integración con sistemas**: POS, inventario: $20,000/mes.
- **Soporte prioritario**: Línea dedicada: $5,000/mes.

**Meta**: En año 2, 20% de ingresos de premium (hoy 0%).

### 4. Alianzas y Partnerships

**Ejemplos**:
- **Proveedores de ingredientes**: Integración de inventario (comisión de referidos).
- **Bancos locales**: Financiamiento para domiciliarios (comisión).
- **Aseguradoras**: Pólizas para comercios (comisión).
- **Plataformas de pago**: Wompi nos paga comisiones bajas por volumen.

**Meta**: 10% de ingresos en año 2.

## Costos Operacionales

### Costos Variables (por pedido)

| Item | Costo | Notas |
|------|-------|-------|
| Procesamiento de pago (Wompi) | 1.9% | Sobre valor del pedido |
| Domiciliario | $3,500 | Incluye gasolina, desgaste |
| Infraestructura (AWS/Firebase) | $200 | Estimado por pedido |
| IA (OpenAI/Claude) | $50 | Por procesamiento de texto |
| **Total variable** | ~$3,800 + 1.9% | Base calculada |

**Sobre pedido de $100,000**:
- Wompi: $1,900
- Domiciliario: $3,500
- Infraestructura: $200
- IA: $50
- **Total**: $5,650 (5.65% del valor)

### Costos Fijos (mensuales)

| Item | Costo | Notas |
|------|-------|-------|
| Servidores (NestJS + DB) | $800 | Produción + staging |
| Almacenamiento (Cloudflare R2) | $100 | Fotos, PDFs de cartas |
| Dominio + CDN | $50 | Infraestructura web |
| WhatsApp Business API | $1,000 | 10,000 conversaciones/mes |
| Logs + Monitoring | $200 | DataDog o similar |
| Team salaries | $15,000 | 3 devs + 1 PM (inicial) |
| **Total fijo** | ~$17,150/mes | Fase MVP |

### Proyección a 1,000 Pedidos/Día

**Ingresos diarios**:
- 1,000 pedidos × $100,000 promedio × 10% = $10,000,000
- Menos Wompi (1.9%): -$1,900,000
- Menos domiciliarios: -$3,500,000
- **Margen bruto**: ~$4,600,000 (46%)

**Costos variables**: $5,650/pedido × 1,000 = $5,650,000/día
**Costos fijos**: $17,150/mes = ~$572/día

**Margen neto (proyectado)**: Positivo con 100+ pedidos/día.

## Modelo de Crecimiento

### Etapa 1: Aceleración en Timbío (Meses 1-3)

**Objetivo**: 50 pedidos/día, 30 comercios activos.

**Tácticas**:
- Prelaunch: Registro manual de comercios piloto (30).
- Launch: Anuncio en grupos locales de WhatsApp.
- Growth: Incentivos a primeros clientes ($5,000 en créditos).
- Retención: Programa de referidos (cliente + $10,000 por amigo).

**Presupuesto**: $50,000 (incentivos + publicidad local).

### Etapa 2: Consolidación en Timbío (Meses 4-6)

**Objetivo**: 300 pedidos/día, 100+ comercios.

**Tácticas**:
- Optimización de IA (mejor recomendaciones).
- Programa de fidelización (puntos por compra).
- Integración con sistemas POS de comercios.
- Aumento de domiciliarios a 50.

**Presupuesto**: $30,000 (desarrollo + experiencias).

### Etapa 3: Expansión Regional (Meses 7-12)

**Objetivo**: 1,000+ pedidos/día, 5 municipios.

**Tácticas**:
- Automatización de onboarding.
- Equipo de soporte multiidioma.
- Campañas de marketing regional.
- Alianzas con bancos/aseguradoras.

**Presupuesto**: $150,000 (expansion + team).

## Estructura de Costos: Comercio

### Para Comercio Pequeño ($1,000,000/mes en ventas)

**Escenario**: Panadería con 20 pedidos/día vía DomiExpress.

- Pedidos/mes: 600
- Valor promedio: $8,000
- Ingresos por DomiExpress: $4,800,000
- Comisión DomiExpress (10%): -$480,000
- **Ingresos netos**: $4,320,000

**ROI**: +$4.32M de ingresos adicionales. Comisión es justificada.

### Para Comercio Mediano ($10,000,000/mes)

**Escenario**: Restaurante con 100 pedidos/día.

- Pedidos/mes: 3,000
- Valor promedio: $50,000
- Ingresos por DomiExpress: $150,000,000
- Comisión DomiExpress (10%): -$15,000,000
- **Ingresos netos**: $135,000,000

**Beneficios adicionales**:
- Visibilidad garantizada (no depende de ranking).
- Datos de clientes (emails, teléfonos).
- Herramientas de marketing.

**ROI**: Altamente positivo.

## Estructura de Costos: Domiciliario

### Ingresos Esperados

**Supuestos**:
- Jornada laboral: 8 horas
- Pedidos activos: 6-8 por jornada
- Fee por pedido: $3,500
- Turnos efectivos: 6 días/semana, 4 semanas/mes

**Cálculo**:
- Pedidos/mes: 8 × 6 × 4 = 192
- Ingresos brutos: 192 × $3,500 = $672,000
- Descuento (gasolina, desgaste): -$120,000
- **Ingresos netos**: $552,000/mes (~$276/hora)

**Comparativa**:
- Salario mínimo Colombia: $416,000/mes
- Ingresos DomiExpress: $552,000/mes (+32%)
- Bonificación por eficiencia: +$50,000 (extra si cumplen SLAs)

### Beneficios Adicionales

- Seguro de accidentes (cubierto por DomiExpress).
- Garantía de ingresos mínimos en días lentos.
- Sin horarios fijos (flexibilidad).
- Capacitación y soporte.

## Punto de Equilibrio

### Supuestos

- Costo fijo mensual: $17,150
- Margen variable por pedido: 10% - 5.65% = 4.35%
- Pedido promedio: $100,000

**Fórmula**:
```
Break-even = Costos Fijos / Margen por Pedido
Break-even = $17,150 / ($100,000 × 0.0435)
Break-even = $17,150 / $4,350
Break-even = ~4 pedidos/día
```

**Conclusión**: Con solo 4 pedidos/día, DomiExpress ya es rentable en fase MVP. Timbío tiene 12,000 habitantes. 4 pedidos/día es trivial.

## Escala a Multi-Municipio

### Modelo de Replicación

Cada nuevo municipio sigue este patrón:

1. **Infraestructura compartida** (0% costo incremental):
   - Servidores de BD existentes (escalable).
   - APIs de IA reutilizables.
   - Plataforma de admin existente.

2. **Costos Fijos Nuevos** (+20% por municipio):
   - Soporte local: 1 person (8 horas/día).
   - Marketing local: $5,000/mes.
   - Equipos de domiciliarios (infraestructura): ~$2,000.

3. **Ingresos** (independiente por municipio):
   - Cada municipio es una P&L separada.
   - La plataforma es agnóstica de municipio.

### Proyección: 10 Municipios en Año 2

| Métrica | Municipio 1 | Municipios 2-10 | Total |
|---------|------------|-----------------|-------|
| Pedidos/día | 500 | 200 c/u × 9 | 2,300 |
| Ingresos/mes | $150M | $13M c/u × 9 | $267M |
| Costos fijos | $17K | $3.4K c/u × 9 | $47K |
| Costos variables | ~$30M | ~$23M | ~$53M |
| **EBITDA** | ~$103M | ~$117M | **$220M** |
| **Margen** | 68% | 58% | **82%** |

**Conclusión**: El modelo de negocio escala naturalmente. La infraestructura no es un cuello de botella.

---

**Propósito de este documento**: Validar que el modelo económico es viable y escalable. Todas las decisiones técnicas deben respetar estas restricciones de costo.
