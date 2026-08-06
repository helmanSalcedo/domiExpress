# Inteligencia Artificial en DomiExpress

## Visión de IA

La IA en DomiExpress NO es un asistente conversacional típico. Es un **intérprete de intención de compra** que:

1. Entiende texto natural del cliente.
2. Extrae entidades (productos, cantidades, restricciones).
3. Busca coincidencias en catálogo.
4. Recomienda comercios sin sesgos.
5. Aprende del comportamiento del cliente.

---

## Casos de Uso de IA

### 1. Análisis de Consulta del Cliente

**Input**: `"Quiero una hamburguesa de pollo sin tomate, una pizza hawaiana y una Coca-Cola"`

**IA procesa**:

```
Entidades extraídas:
  [
    {
      "type": "product",
      "name": "hamburguesa",
      "attributes": {
        "protein": "pollo",
        "customizations": ["sin tomate"]
      },
      "quantity": 1
    },
    {
      "type": "product", 
      "name": "pizza",
      "attributes": {
        "flavor": "hawaiana"
      },
      "quantity": 1
    },
    {
      "type": "product",
      "name": "Coca-Cola",
      "attributes": {
        "size": "implicit_default"
      },
      "quantity": 1
    }
  ]

Confianza: 0.95 (95%)
Ambigüedad: Bajo (Coca-Cola podría ser pequeña o grande)

Categorías inferidas: ["restaurante", "comida_rápida", "tienda"]

Intención: COMPRAR (no información)
Urgencia: NORMAL (no dice "rápido" o "urgente")
```

**Backend**:
- Si confianza >85%: Proceder.
- Si confianza 70-85%: Pedir clarificación: "¿Coca-Cola pequeña o grande?"
- Si confianza <70%: "No entendí bien. ¿Podrías repetir?"

---

### 2. OCR para Catálogos (Onboarding de Comercio)

**Input**: PDF de menú de pizzería (5 páginas, 2MB).

**IA procesa**:

```
OCR:
  Extrae texto de cada página
  Confianza de extracción: 0.92
  
Estructura:
  Detecta secciones:
    - PIZZAS
    - BEBIDAS  
    - POSTRES
    - COMBOS
    
Entidades:
  Por cada línea:
    - Nombre de producto
    - Descripción
    - Precio (si existe)
    - Ingredientes
    
Ejemplo:
  "Hawaiana - Piña y jamón - $28,000" 
    → Producto: "Hawaiana"
    → Ingredientes: ["piña", "jamón"]
    → Precio: 28000
    → Categoría: "pizzas"

Resultado:
  28 productos identificados
  4 categorías detectadas
  Confianza global: 0.88
```

**Validaciones**:
- Si confianza <85%: Pedir confirmación manual.
- Si ve números anómalos (precio $10,000,000): Alerta.

---

### 3. Búsqueda de Comercios

**Input**: Productos extraídos.

**IA + Búsqueda**:

```
Búsqueda 1: Hamburguesa de pollo
  Comercios con hamburguesa de pollo:
    - Burguerking (40,000)
    - Don Julio (35,000)
    - Gourmet Burger (50,000)
    - Comida Rápida Central (38,000)
    - El Traqueto (32,000)

Ranking (SIN sesgo algorítmico):
  Mostrar en orden:
    1. Random (50% del tiempo)
    2. Cercano (30% del tiempo)
    3. Rating (20% del tiempo)
  
  Objetivo: No priorizar Rappi-style
  (top 3 siempre, otros nunca se ven)
```

**Búsqueda 2: Pizza Hawaiana**

```
Comercios: Pizzalandia, El Horno, Las Reinas
Misma estrategia: Mostrar todos
```

---

### 4. Detección de Fraude

**Parámetros** que alimentan modelo de fraude:

```
NIVEL DE RIESGO = 
  0.3 × ip_reputation_score +
  0.25 × card_history_score +
  0.2 × geolocation_anomaly +
  0.15 × amount_deviation +
  0.1 × customer_history_score

Si NIVEL > 0.7:
  → Rechazar o pedir 2FA
```

**Entrenamiento**: 
- Datos históricos de transacciones fraudulentas.
- Feedback de disputas.
- Reportes de Wompi.

---

### 5. Predicción de ETA

**Input**: 
- Distancia comercio → cliente.
- Hora del día.
- Día de la semana.
- Clima.
- Tipo de vehículo (bicicleta/moto/carro).

**Modelo**:
```
ETA = base_time + 
      traffic_factor × hour_factor × 
      weather_factor × vehicle_factor

Ejemplo:
  Base: 5 minutos (1 km)
  Hora: 1.2x (es hora pico)
  Clima: 1.1x (lluvia)
  Vehículo: 1.0x (moto)
  → ETA = 5 × 1.2 × 1.1 × 1.0 = 6.6 min
```

**Precisión objetivo**: ±5 minutos en 80% de casos.

---

### 6. Clasificación de Intención

**Input**: Mensaje del cliente.

**Clasificador**:

```
Intenciones posibles:
  - BUSCAR_PRODUCTO (60% casos)
  - CONSULTAR_ESTADO (15% casos)  
  - REPORTAR_PROBLEMA (10% casos)
  - PEDIR_REFUND (10% casos)
  - OTROS (5% casos)

Ejemplo: "¿Dónde está mi pedido?"
  → Intención: CONSULTAR_ESTADO
  → Confianza: 0.99

Ruteo:
  - Si BUSCAR: Ir a búsqueda de productos
  - Si CONSULTAR: Mostrar estado de pedido
  - Si REPORTAR/REFUND: Escalar a humano
```

---

### 7. Recomendación Personalizada

**Input**: Historial de cliente.

**Modelo**:

```
Cliente Juan:
- Histórico: 20 compras
- Favoritos: Pizzalandia (8 compras), Don Julio (7 compras)
- Horarios: Pide entre 12-2 PM y 6-9 PM
- Presupuesto: $30,000-80,000
- Preferencias: Vegan 50%, Picante 30%

Próxima recomendación:
  "Juan, en tu horario usual, 
   Pizzalandia tiene pizza vegana nueva.
   ¿Interesa?"

Consentimiento:
  ✅ Solo si cliente activó recomendaciones
  ✅ Máximo 1 recomendación/día
  ✅ Respetar "no quiero recomendaciones"
```

---

## Modelos Específicos

### Modelo 1: NLU (Natural Language Understanding)

**Propósito**: Extraer intención y entidades.

**Tecnología**: 
- Claude API (3.5 Sonnet o superior).
- Fine-tuning con dataset de 1,000+ queries reales.
- Fallback a keywords si IA lenta.

**Latencia objetivo**: <2 segundos.

**Prompt optimizado**:
```
Eres un experto en e-commerce de comida a domicilio.

Analiza este mensaje de cliente y extrae:
1. Productos (nombre, cantidad, atributos, personalizaciones)
2. Categorías estimadas
3. Confianza (0-1)
4. Necesita clarificación? (sí/no)
5. Texto de clarificación

Input: "{user_message}"

Responde en JSON.
```

---

### Modelo 2: Multimodal OCR

**Propósito**: Extraer catálogos de PDF/fotos.

**Tecnología**:
- Claude Vision API (analizar fotos/PDFs).
- Tesseract.js (OCR fallback).
- Structured output para JSON.

**Latencia**: <5 segundos por PDF.

**Ejemplo**:
```
PDF de menú → Claude Vision 
  → Extrae texto, estructura, precios
  → JSON de productos
  → Backend valida y guarda
```

---

### Modelo 3: Embeddings para Búsqueda

**Propósito**: Encontrar productos similares.

**Tecnología**:
- OpenAI text-embedding-3-small.
- Guardar embeddings en Postgres (pgvector).
- Búsqueda semántica: `SELECT * WHERE embedding <=> query_embedding LIMIT 5`.

**Ejemplo**:
```
Cliente busca: "Hamburguesa con mucho queso"

Embedding de búsqueda:
  [0.123, -0.456, 0.789, ...]

Top 5 productos similares:
  1. "Hamburguesa Cheddar Extra" (0.98 similarity)
  2. "Burger Queso Fundido" (0.95 similarity)
  3. "Hamburguesa Triple Queso" (0.92 similarity)
  ...
```

---

### Modelo 4: Fraud Detection (XGBoost)

**Propósito**: Detectar transacciones fraudulentas.

**Features**:
```
- IP address reputation (0-1)
- Card BIN country vs user location
- Amount deviation from customer average
- Time anomaly (nunca compró a esta hora)
- Geolocation anomaly (cambio imposible)
- Merchant category anomaly
- Number of declined attempts
```

**Entrenamiento**:
- Dataset histórico: 50,000 transacciones.
- Etiquetas: 1% conocido como fraude.
- Split: 70% train, 15% val, 15% test.
- AUC target: >0.95.

---

### Modelo 5: ETA Prediction (XGBoost)

**Propósito**: Predecir tiempo de entrega.

**Features**:
```
- Distancia (km)
- Hora del día (discretizado)
- Día de la semana
- Clima (sunny, rainy, etc.)
- Tipo de vehículo (0=bike, 1=moto, 2=car)
- Saturación del municipio (pedidos/hora)
```

**Target**: Tiempo real de entrega en minutos.

**Entrenamiento**:
- Dataset: 10,000+ entregas reales.
- Actualización: Retraining mensual con datos nuevos.

---

## Limitaciones Actuales

### Lo que IA NO hace (Etapa 1)

```
❌ Conversación multiturno compleja
❌ Entender chistes/contexto cultural profundo
❌ Procesar imágenes de productos (solo OCR de texto)
❌ Generar descripciones automáticas
❌ Detectar emociones/sentimientos
❌ Predecir demanda agregada por producto
```

### Fallbacks

```
Si IA falla:
  1. Keyword matching básico
  2. Si eso falla: Mostrar categorías manualmente
  3. Si eso falla: Escalar a humano
```

---

## Privacy en IA

### Datos que IA VE

```
✓ Mensaje actual (no almacenado)
✓ Atributos del cliente (anónimizados)
✓ Catálogo del comercio (público)
```

### Datos que IA NO VE

```
❌ Nombre del cliente
❌ Teléfono del cliente
❌ Historial completo
❌ Método de pago
❌ Ubicación exacta
```

### Almacenamiento

```
Logs de IA:
- Mensaje de usuario: BORRADO después de 24h
- Embeddings: BORRADOS después de 7 días
- Métricas anónimas: Guardadas (sin PII)
```

---

## Roadmap de IA

### Fase 1 (Hoy)
- NLU básico
- OCR de catálogos
- Búsqueda semántica
- Fraude detection
- ETA prediction

### Fase 2 (Mes 3-4)
- Multi-turn conversation
- Recomendaciones personalizadas
- Análisis de sentimiento
- Predicción de churn
- Pricing dinámico

### Fase 3 (Mes 6-9)
- Procesamiento de imágenes
- Generación automática de descripciones
- Previsión de demanda
- Optimización de rutas
- Asistente para comercios

### Fase 4 (Año 2)
- Modelos multimodales
- IA generativa de contenido
- Auto-categorización de productos
- Predicción de tendencias
- Análisis de satisfacción del cliente

---

## Costos de IA

### Mensual (Estimado)

| Servicio | Costo | Volumen | Notas |
|----------|-------|--------|-------|
| Claude API (NLU) | $0.05/k tokens | 100M tokens | ~$5,000 |
| OpenAI Embeddings | $0.02/1M | 10M embeddings | $200 |
| XGBoost Training | $0 | Propio | Hosting |
| Almacenamiento (pgvector) | $100 | - | DB |
| **Total** | - | - | ~$5,300 |

**Por pedido**: $5,300 / 5,000 pedidos = $1.06/pedido (acceptable).

---

**Propósito**: Documentar cómo IA impulsa la plataforma. No es un chatbot; es un motor de búsqueda inteligente.
