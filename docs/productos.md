# Gestión de Productos

## Definición de Producto

**Producto** = Artículo único vendible por un comercio.

```json
{
  "id": "PROD-1234",
  "commerce_id": "COM-9101",
  "name": "Pizza Hawaiana Mediana",
  "description": "Pizza con jamón y piña",
  "category": "pizzas",
  "price": 28000,
  "currency": "COP",
  "stock_status": "in_stock", // in_stock | out_of_stock | limited
  "active": true,
  "sku": "PIZZA-HAW-MED",
  "images": ["url1", "url2"],
  "ingredients": ["masa", "queso", "jamón", "piña"],
  "allergens": ["gluten", "lácteos", "cerdo"],
  "is_vegan": false,
  "is_vegetarian": false,
  "preparation_time_minutes": 15,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-15T18:30:00Z"
}
```

---

## Ciclo de Vida del Producto

### Creación

**Métodos**:

1. **Automático (IA - Recomendado)**
   - Comercio carga PDF/fotos.
   - IA extrae productos.
   - Sistema crea registros.
   - Comercio revisa y aprueba.

2. **Manual**
   - Comercio escribe cada producto en WhatsApp.
   - Sistema pregunta por cada campo.
   - Lento pero flexible.

---

### Validación

**Campos requeridos**:
```
✓ Nombre (max 100 caracteres)
✓ Categoría (de catálogo global)
✓ Precio (>0, realista para municipio)
✓ Descripción (opcional pero recomendado)
```

**Validaciones**:
```
✓ Nombre no duplicado en el mismo comercio
✓ Precio no varía >30% con histórico
✓ Categoría existe en sistema
✓ Descripción no tiene palabras prohibidas
```

---

### Activación

Una vez validado: `active = true`

**Entonces**:
- Aparece en búsquedas.
- Aparece en catálogo del comercio.
- Clientes pueden comprar.

---

### Modificación

**Permitido**:
- Cambiar descripción.
- Cambiar precio (pero lo ve el cliente en búsqueda).
- Cambiar imagen.
- Cambiar disponibilidad (out_of_stock).
- Cambiar ingredientes.

**No permitido**:
- Cambiar ID (es inmutable).
- Cambiar historial de precios.

**Cambio de precio: Regla especial**
```
Si cambias precio:
  - Se aplica SOLO a nuevos pedidos
  - Pedidos en carrito: Usan precio viejo
  - Notificación al cliente: "Precio cambió desde $X a $Y"
```

---

### Descontinuación

**Soft delete** (no borrar):

```
Cambiar: active = false

Resultado:
  - NO aparece en búsquedas nuevas
  - Pero historial se preserva (auditoría)
  - Comercio puede reactivar
```

---

## Categorías de Productos

### Categorías Globales (Sistema)

Todas las categorías posibles en DomiExpress:

```
RESTAURANTES:
  - Pizzas
  - Hamburguesas
  - Pollo frito
  - Empanadas
  - Sushi
  - Comida china
  - Comida india
  - Comida italiana
  - Comida mexicana
  - Comida vegetariana/vegan
  - Ensaladas
  - Bowls
  - Sándwiches
  - Wraps
  - Soups
  - Postres
  - Bebidas

TIENDAS:
  - Abarrotes
  - Snacks
  - Bebidas
  - Dulces
  - Artículos de aseo
  - Lácteos

SUPERMERCADOS:
  - (Todas las anteriores)

DROGUERÍAS:
  - Medicamentos sin receta
  - Suplementos
  - Cuidado personal
  - Cosméticos
  - Aparatos médicos

LIBRERÍAS:
  - Libros
  - Cuadernos
  - Útiles escolares

FLORERÍAS:
  - Flores frescas
  - Arreglos florales
  - Plantas

... etc
```

### Categorías por Comercio

Cada comercio define sus PROPIAS categorías (submenu):

```
Pizzalandia:
  - PIZZAS CLÁSICAS
    - Margherita
    - Hawaiana
    - Carnes
  - PIZZAS PREMIUM
    - Trufa
    - Jamón Serrano
  - BEBIDAS
  - POSTRES
  
Don Julio:
  - HAMBURGUESAS
  - COMPLETOS
  - ACOMPAÑAMIENTOS
  - BEBIDAS
```

---

## Stock/Inventario

### Estados de Stock

```
in_stock:     Disponible, cantidad ilimitada
limited:      Disponible, cantidad limitada (muestra "quedan X")
out_of_stock: Agotado, no se puede comprar
```

### Gestión de Stock

**Método 1: Manual**
```
Comercio escribe en WhatsApp:
  "Agotamos pizza hawaiana"
  
Sistema actualiza: stock_status = out_of_stock
```

**Método 2: Automático (Futuro)**
```
Integración con sistema POS del comercio
  → Cada venta decrementa stock
  → Si stock <= 0: out_of_stock
```

### Dinámicas de Stock

```
Si producto agotado:
  - NO aparece en búsqueda
  - Pero aparece en "Productos similares"
  - Cliente ve: "Este producto está agotado"
  - Se sugieren alternativas de otros comercios
```

---

## Precio y Variantes

### Precio Base

```
Producto: Pizza Hawaiana
Precio: $28,000

Este es el precio en tamaño/versión DEFAULT
```

### Variantes (Futuro)

```
Producto: Pizza Hawaiana

Variantes:
  - Pequeña (20cm): $22,400 (80%)
  - Mediana (30cm): $28,000 (100%)
  - Grande (40cm): $42,000 (150%)
```

**En Etapa 1**: No hay variantes. Solo precio único.

### Promociones (Futuro)

```
Ejemplo:
  - Compra 2 pizzas, paga 1.5x
  - Descuento de $5,000 si vales >$50,000
  - Happy Hour: 20% descuento 5-7 PM
```

**En Etapa 1**: No hay promociones. Solo precio fijo.

---

## Atributos Especiales

### Ingredientes

**Capturado automáticamente**:
```
IA extrae de descripción/PDF:
  - Ingredientes principales
  - Ingredientes ocultos (gluten en salsa)
```

**Usos**:
- Cliente busca: "Sin gluten"
- IA filtra productos con "gluten" en ingredientes
- Muestra solo productos safe

### Alérgenos

**Etiquetas de alérgenos**:
```
Productos con:
  ✓ Gluten
  ✓ Lácteos
  ✓ Nueces
  ✓ Cerdo
  ✓ Mariscos
  ✓ Huevo
  ✓ Soja
```

**Responsabilidad legal**:
- Comercio es responsable de precisión.
- Sistema muestra claramente.
- Cliente puede reportar error.

### Certificaciones

```
✓ Vegan (sin productos animales)
✓ Vegetariano (sin carne)
✓ Orgánico (si lo es)
✓ Sin gluten
✓ Kosher (futuro)
```

---

## Búsqueda y Descubrimiento

### Búsqueda por Nombre

```
Cliente: "Hamburguesa con queso"

IA busca:
  - Nombre exacto: "Hamburguesa con queso"
  - Nombres similares: "Burger con cheddar"
  - Ingredientes: Cualquier producto con "queso"

Muestra:
  - Resultados ordenados por relevancia
  - Filtro por comercio
  - Ordenar por precio/rating/distancia
```

### Búsqueda por Categoría

```
Cliente: "Dame una pizza"

IA:
  1. Categoría: pizzas
  2. Busca todos los productos con categoría "pizzas"
  3. Filtra por comercios activos
  4. Ordena sin sesgo
```

### Filtros

**Disponibles para cliente**:
```
- Precio (min-max)
- Rating del comercio (min)
- Tiempo de preparación
- Vegan/Vegetariano
- Sin gluten
- Distancia (km)
```

---

## Sincronización de Catálogos

### Importación Manual

```
Comercio sube PDF
  → IA procesa
  → Sistema crea productos
  → Comercio revisa en WhatsApp
  → Aprueba o corrige
  → Productos van en vivo
```

### Importación Automática (Futuro)

```
Comercio integra sistema POS
  → Sync diario
  → Cambios de precio/stock automáticos
  → Sin trabajo manual
```

---

## Analítica de Productos

**Datos capturados**:
```
Por producto:
  - Búsquedas (cuántas veces fue buscado)
  - Conversión (cuántas búsquedas → compra)
  - Revenue (dinero generado)
  - Rating promedio
  - Comentarios

Por comercio:
  - Top 10 productos
  - Productos sin ventas (candidatos a quitar)
  - Precio competitivo vs otros comercios
```

---

## Gobernanza de Productos

### Prohibiciones

**No se permite vender**:
```
❌ Drogas ilegales
❌ Armas
❌ Explosivos
❌ Falsificados
❌ Productos biológicos peligrosos
❌ Servicios sexuales
❌ Dinero/criptomonedas
```

**Si se detecta**: Suspensión inmediata del comercio.

### Control de Calidad

**Sistema monitorea**:
```
✓ Descripciones sin abusos (spam, clickbait)
✓ Precios realistas (no $10,000,000 por arepa)
✓ Imágenes sin contenido explícito
✓ Nombres sin palabras prohibidas
```

**Acción si hay problema**:
```
1. Aviso al comercio
2. Oportunidad de corregir (24h)
3. Si no corrige: Suspensión de producto
4. Si reincide: Suspensión de comercio
```

---

**Propósito**: Documentar cómo los productos fluyen por el sistema, desde creación hasta auditoría.
