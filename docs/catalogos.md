# Gestión de Catálogos

## Definición

**Catálogo** = Colección de todos los productos de un comercio, organizados por categorías.

El catálogo es el corazón de la experiencia de compra.

---

## Estructura del Catálogo

```
Comercio: Pizzalandia

Catálogo:
  📂 PIZZAS CLÁSICAS
    - Margherita ($25,000)
    - Hawaiana ($28,000)
    - Carnes ($32,000)
    - Vegana ($26,000)
  
  📂 PIZZAS PREMIUM
    - Con Trufa Negra ($55,000)
    - Jamón Serrano ($60,000)
    - Queso Artesanal ($50,000)
  
  📂 BEBIDAS
    - Gaseosa pequeña ($3,000)
    - Gaseosa grande ($5,000)
    - Cerveza importada ($12,000)
  
  📂 POSTRES
    - Tiramisú ($15,000)
    - Flan ($10,000)
```

---

## Creación de Catálogo

### Método 1: Automático (PDF/Foto)

**Comercio sube PDF de menú**:

```
1. Dueño: "Tengo el menú en PDF"
2. Sistema: "Comparte el archivo"
3. Dueño comparte PDF
4. IA procesa:
   - OCR extrae texto
   - Detecta categorías
   - Extrae precios
   - Identifica ingredientes
5. Sistema muestra: "Detecté 28 productos"
6. Dueño revisa y aprueba
7. Catálogo está VIVO
```

**Tiempo**: 5 minutos.

### Método 2: Manual (Escrito)

**Comercio describe verbalmente**:

```
Dueño: "Vendemos hamburguesas de pollo y res,
        papas fritas, gaseosas"

Sistema pregunta por cada:
  - Nombre exacto
  - Precio
  - Descripción
  - Ingredientes

Tiempo: 15+ minutos (tedioso)
```

**Recomendación**: Usar método 1.

---

## Organización de Categorías

### Categorías por Tipo de Comercio

**Restaurante**:
```
- Entradas
- Platos principales
- Acompañamientos
- Bebidas
- Postres
```

**Tienda de barrio**:
```
- Abarrotes
- Bebidas
- Dulces
- Artículos de aseo
```

**Supermercado**:
```
- Frescos
- Lácteos
- Bebidas
- Congelados
- Artículos de aseo
- Electrónica
- ... etc
```

**Droguería**:
```
- Medicamentos sin receta
- Suplementos
- Cuidado personal
- Cosméticos
```

---

## Búsqueda en Catálogo

Cliente busca en múltiples formas:

### 1. Por Nombre

```
Cliente: "Hamburguesa"
Sistema busca productos con "hamburguesa" en nombre
Resultado: Hamburguesa de pollo, Hamburguesa de res, etc.
```

### 2. Por Categoría

```
Cliente: "Dame algo de la categoría Bebidas"
Sistema muestra todas las bebidas del comercio
Resultado: [Gaseosa, Jugo, Cerveza, Café, etc.]
```

### 3. Por Ingrediente

```
Cliente: "Sin gluten"
Sistema filtra productos SIN gluten (verifica ingredientes)
Resultado: Pizza sin gluten, Hamburguesa sin gluten, etc.
```

### 4. Por Precio

```
Cliente: "Algo entre $10,000 y $20,000"
Sistema filtra por rango de precio
Resultado: Empanadas, Sándwiches, etc.
```

---

## Gestión de Catálogo (Para Comercio)

### Ver Catálogo

Comercio puede ver su catálogo en panel:
```
admin.domiexpress.app/commerces/[id]/catalog

Muestra:
  - Todos los productos
  - Categorías
  - Precios actuales
  - Disponibilidad
  - Rating de cada producto
```

### Editar Productos

**Cambios permitidos**:
```
- Nombre
- Descripción
- Precio (afecta nuevas ordenes)
- Disponibilidad (in_stock / out_of_stock)
- Imagen
- Ingredientes
```

**Cambios NO permitidos**:
```
- Borrar histórico de precios
- Cambiar ID del producto
```

### Agregar Producto

```
Comercio en WhatsApp: "Tengo nuevo producto: Tacos al pastor"

Sistema: "OK, cuéntame:
  - ¿Precio?
  - ¿Descripción?
  - ¿Ingredientes?
  - ¿Categoría?"

Dueño proporciona datos
Sistema agrega a catálogo
Producto es ACTIVO inmediatamente
```

### Descontinuar Producto

```
Comercio: "No vendemos más hamburguesa de res"

Sistema: Cambiar a inactive (no borrar)

Resultado:
  - NO aparece en búsquedas nuevas
  - Historial se preserva
  - Puede reactivivarse
```

---

## Sincronización de Catálogos

### Problema: Desincronización

```
Realidad en Pizzalandia: Tienen 15 pizzas
BD de DomiExpress: Muestra 28 pizzas (menú viejo)

Resultado: Cliente pide producto que NO existe
           Comercio rechaza
           Cliente frustrado
```

### Solución 1: Sync Manual

```
Comercio actualiza catálogo periódicamente:
  - Semanal: Revisa y actualiza
  - Semanal: Aprueba cambios de IA

Tiempo: 30 minutos/semana
```

### Solución 2: Integración POS (Futuro)

```
Sistema POS → DomiExpress
  Cambios de precio: Sync automático
  Cambios de stock: Sync automático
  Nuevos productos: Sync automático

Tiempo: 0 minutos (automático)
```

---

## Visibilidad del Catálogo

### Para Clientes

Cliente ve catálogo de comercio cuando:

```
1. Busca producto específico
   → Sistema muestra comercios que lo tienen
   
2. Abre perfil de comercio
   → Ve TODAS las categorías del catálogo
   
3. Navega por categorías
   → Ve productos por tema
```

### Para Admin

Admin ve:

```
- Catálogos de TODOS los comercios
- Productos más vendidos
- Productos con bajo rating
- Productos agotados frecuentemente
- Precios comparativos entre comercios
```

---

## Auditoría de Catálogo

Todos los cambios se registran:

```
CATALOG_AUDIT_LOG:
  - commerce_id
  - product_id
  - change_type (added | modified | removed)
  - old_value
  - new_value
  - changed_by (who: commerce admin, system, support)
  - timestamp
```

**Retención**: 7 años (compliance).

---

## Problemas Comunes

### Problema 1: Catálogo Incompleto

```
Comercio tiene 50 productos, catálogo muestra 10

Causas:
  1. PDF incompleto (menú viejo)
  2. Productos no aprobados aún
  3. Comercio no terminó de cargar

Solución:
  - Pedir nuevo PDF
  - Cargar manualmente
  - Reactivar productos descontinuados
```

### Problema 2: Precios Incorrectos

```
Catálogo dice: Pizza $25,000
Comercio cobra: $30,000

Solución:
  - Cliente reporta
  - Admin valida
  - Actualiza en sistema
  - Acción contra comercio (si es patrón)
```

### Problema 3: Productos Fantasma

```
Catálogo muestra producto X
Comercio rechaza porque está agotado (NO lo actualiza)

Solución:
  - Cliente se frustra
  - Sistema sugiere alternativas
  - Admin penaliza comercio
```

### Problema 4: Spam en Catálogo

```
Comercio agrega 100+ productos inútiles
Descripción: "Oferta especial", "Descuento", "Gratis"

Solución:
  - Admin revisa catálogo
  - Solicita limpieza en 24h
  - Si no cumple: Suspende catálogo
```

---

## Mejores Prácticas

### Para Comercios

```
✓ Mantener catálogo actualizado (semanal)
✓ Precios realistas (no cambios >20% sin aviso)
✓ Descripciones claras y honestas
✓ Ingredientes precisos (alérgenos críticos)
✓ Imágenes de buena calidad
✓ Categorías lógicas (fácil de navegar)

❌ No agregar productos falsos
❌ No cobrar diferente que en catálogo
❌ No poner precios de broma
❌ No actualizar catálogo infrecuentemente
```

### Para Sistema

```
✓ Validar precios (no varían >30% instantáneamente)
✓ Validar descripciones (sin spam)
✓ Validar imágenes (no escandalosas)
✓ Notificar cambios al cliente
✓ Sugerir alternativas cuando hay agotamiento
✓ Auditar regularmente
```

---

**Propósito**: Documentar cómo se gestiona el catálogo, el núcleo de la experiencia de compra.
