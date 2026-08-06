# Personalizaciones de Productos

## Concepto

Personalización = **Modificación de un producto** antes de ser preparado.

Cliente NO elige de opciones pre-definidas. Escribe naturalmente.

**Ejemplo**:
```
Cliente: "Una hamburguesa sin tomate, sin cebolla, con mucho queso"
Sistema: Envía al comercio: "Hamburguesa SIN tomate, SIN cebolla, MUCHO queso"
```

---

## Tipos de Personalización

### 1. Remover Ingredientes

**Más común**: 60% de personalizaciones.

```
\"Sin tomate\"
\"Sin cebolla\"
\"Sin lechuga\"
\"Sin salsa picante\"
\"Sin queso\"

Costo: GRATIS
Comunicación: Texto simple al comercio
```

### 2. Agregar Ingredientes

**Común**: 25% de personalizaciones.

```
\"Con queso cheddar extra\"
\"Agregar huevo\"
\"Doble carne\"
\"Más salsa\"
\"Extra crispy\"

Costo: +15% a +50% del precio (configurable por comercio)
Restricción: Solo ingredientes que el comercio tiene
```

### 3. Cambiar Ingrediente

**Menos común**: 10% de personalizaciones.

```
\"Reemplaza tomate por cebolla\"
\"Pollo en vez de cerdo\"
\"Arroz integral en vez de blanco\"

Costo: Si ingrediente alternativo es más caro, +5-20%
Restricción: Debe existir ingrediente alternativo
```

### 4. Especificaciones de Preparación

**Raro pero importante**: 5% de personalizaciones.

```
\"Bien hecha\" (carne)
\"Al dente\" (pasta)
\"Extra crispy\" (pollo)
\"Caliente\" (sopa)
\"Frío\" (jugo)

Costo: GRATIS
Comunicación: Indicación especial al comercio
```

---

## Flujo de Personalización

### Paso 1: Cliente Escribe

```
\"Quiero una hamburguesa de pollo sin tomate, 
sin cebolla, con queso mozzarella extra y salsas al lado\"
```

### Paso 2: IA Extrae

```
Producto base: Hamburguesa de pollo

Personalizaciones:
  [
    {
      \"type\": \"remove\",
      \"ingredient\": \"tomate\",
      \"cost_impact\": 0
    },
    {
      \"type\": \"remove\",
      \"ingredient\": \"cebolla\",
      \"cost_impact\": 0
    },
    {
      \"type\": \"add\",
      \"ingredient\": \"mozzarella\",
      \"quantity\": \"extra\",
      \"cost_impact\": 8000
    },
    {
      \"type\": \"specification\",
      \"detail\": \"salsas al lado\",
      \"cost_impact\": 0
    }
  ]

Precio final:
  Base: 40,000
  + Mozzarella extra: 8,000
  = 48,000
```

### Paso 3: Cliente Revisa

```
IA propone:
\"Hamburguesa de pollo:
  - Sin tomate
  - Sin cebolla
  - Queso mozzarella extra
  - Salsas al lado
  
Precio: $48,000 (antes: $40,000)

¿Confirmar?\"

Cliente: \"Sí\" o \"No, cambiar...\"
```

### Paso 4: Se Envía al Comercio

```
Pedido en WhatsApp del comercio:

\"1x Hamburguesa de pollo
  → Sin tomate
  → Sin cebolla
  → Queso mozzarella extra
  → Salsas al lado
  
Cliente: Juan García
Precio: $48,000\"
```

### Paso 5: Comercio Prepara

Comercio entiende perfectamente qué hacer.

---

## Restricciones de Personalización

### Límites por Producto

```
Máximo de personalización por producto:
  - Máximo 5 cambios
  - Máximo +100% en costo (no puede duplicar precio)
  - No se pueden remover ingredientes críticos
```

**Ejemplo de RECHAZO**:
```
Cliente: \"Una pizza sin masa\"
IA rechaza: \"No puedo hacer una pizza sin masa.
            ¿Quizás quisiste otra cosa?\"
```

### Ingredientes Protegidos

```
Algunos ingredientes NO se pueden remover:
  - Masa (en pizzas)
  - Pan (en sándwiches)
  - Carne base (en hamburguesas)
  
Si cliente intenta: Sistema pide aclaración.
```

### Alergias y Seguridad

```
Si cliente quiere \"Sin gluten\":
  - Sistema valida si el producto tiene gluten
  - Si tiene: Advierte al comercio \"ALERGIA: SIN GLUTEN\"
  - Comercio confirma que puede garantizarlo
  - Si no puede: Rechaza pedido
```

---

## Costo de Personalización

### Matriz de Costos

```
REMOVER: Siempre GRATIS
AGREGAR (ingrediente normal): +$2,000-5,000
AGREGAR (ingrediente premium): +$5,000-15,000
REEMPLAZAR: 0% a +10% (depende de ingredientes)
ESPECIFICACIÓN: GRATIS
```

### Ejemplos

```
Hamburguesa ($40,000):
  + Sin tomate: $0 → $40,000
  + Queso extra: +$3,000 → $43,000
  + Carne doble: +$10,000 → $53,000
  = TOTAL: $53,000

Pizza ($28,000):
  + Sin cebolla: $0 → $28,000
  + Extra queso: +$5,000 → $33,000
  + Borde relleno de queso: +$8,000 → $41,000
  = TOTAL: $41,000
```

---

## Especificaciones de Comercio

Cada comercio configura SUS costos de personalización:

```
Comercio: Burguerking

Configuración:
  - Agregar queso extra: +$3,000
  - Agregar carne: +$8,000
  - Cambiar tipo de queso: +$2,000
  - Agregar salsas premium: +$5,000

Comercio: Don Julio

Configuración:
  - Agregar queso: +$5,000 (más caro)
  - Agregar carne: +$12,000 (más caro)
  - Ingredientes locales: +$3,000
```

---

## Comunicación de Personalización

### Al Cliente

Siempre claro y confirmado:

```
\"Resumen de tu pedido:

1x Hamburguesa de pollo - $40,000
  ├ Sin tomate
  ├ Sin cebolla
  ├ Queso mozzarella extra (+$3,000)
  └ Salsas al lado

Total con personalizaciones: $43,000

¿Confirmar?\"
```

### Al Comercio

Texto puro, ultra claro:

```
\"1x Hamburguesa de pollo - $43,000

ESPECIFICACIONES:
→ SIN tomate
→ SIN cebolla
→ QUESO MOZZARELLA EXTRA
→ Salsas al lado

Cliente: Juan García, Cra 5 #3-45\"
```

---

## Validaciones de IA

### Coherencia

```
Cliente: \"Quiero pizza sin gluten con masa de trigo\"

IA detecta contradicción:
  \"Detecté una contradicción.
   ¿Pizza sin gluten pero con masa de trigo?
   
   La masa de trigo tiene gluten.
   
   Opciones:
   1. Pizza sin gluten (masa especial)
   2. Pizza normal con masa de trigo\"
```

### Disponibilidad

```
Cliente: \"Pizza con trufa blanca\"

IA busca en catálogo:
  - Don Julio: NO tiene trufa
  - Pizzalandia: Tiene trufa (trufa negra, no blanca)
  
IA sugiere:
  \"No encontré pizza con trufa blanca.
   Pero Pizzalandia ofrece pizza con trufa NEGRA.
   ¿Interesa?\"
```

### Realismo

```
Cliente: \"Hamburguesa con 10 tipos de queso\"

IA rechaza:
  \"Eso es demasiado queso.
   Máximo puedo agregar 3 tipos.
   ¿Cuál preferes?\"
```

---

## Ejemplos de Casos Edge

### Caso 1: Cambio de Categoría

```
Cliente: \"Una hamburguesa pero que sea vegan\"

IA entiende:
  Esto NO es personalización simple
  Necesita un producto completamente diferente
  
IA responde:
  \"No puedo hacer hamburguesa vegan de carne.
   
   Pero encontré estas opciones:
   1. Hamburguesa de lentejas (vegan)
   2. Hamburguesa de setas (vegan)\"
```

### Caso 2: Ingrediente No Existe

```
Cliente: \"Hamburguesa con trufa y caviar\"

IA:
  - Trufa: Posible (costo alto)
  - Caviar: Posible pero MUY caro
  
IA propone:
  \"¿Confirmas hamburguesa con:
   - Trufa: +$25,000
   - Caviar: +$50,000
   Total: $115,000?
   
   (Precio muy alto, ¿es lo que querías?)\"
```

### Caso 3: Rechazo por Capacidad

```
Cliente: \"Quiero 5 hamburguesas, cada una con
         5 personalizaciones diferentes\"

Comercio ve que es demasiado:
  El comercio rechaza
  
IA ofrece alternativas:
  \"El comercio está muy ocupado.
   ¿Prefieres:
   1. Esperar +30 minutos
   2. Cambiar de comercio
   3. Reducir personalizaciones\"
```

---

## Auditoría de Personalización

Todos los cambios se registran:

```
CUSTOM_AUDIT_LOG:
  - order_id: ORD-123
  - product: Hamburguesa
  - original_price: 40,000
  - customizations: [{type, ingredient, cost_impact}]
  - final_price: 48,000
  - timestamp: 2024-01-15T18:35:42Z
  - client_confirmed: true
  - merchant_prepared: true
```

---

**Propósito**: Documentar cómo clientes personalizan sin limitarse a menús predefinidos. Debe funcionar de manera natural y flexible.
