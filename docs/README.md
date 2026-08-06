# Documentación de DomiExpress

## 📚 Introducción

Esta carpeta contiene la documentación completa del producto DomiExpress en su **ETAPA 1: Especificación Funcional**.

**Objetivo**: Definir completamente QUÉ es DomiExpress, cómo funciona y por qué, ANTES de escribir una línea de código.

**Audiencia**: Product managers, arquitectos, ingenieros, diseñadores.

---

## 📖 Documentos por Categoría

### Fundamentos del Producto

1. **[vision.md](vision.md)** - Visión a largo plazo
   - Propósito general
   - Diferenciación del mercado
   - Principios fundamentales
   - Éxito medido
   - Roadmap de alto nivel
   
   **Leer si**: Necesitas entender qué es DomiExpress a alto nivel.

2. **[arquitectura-negocio.md](arquitectura-negocio.md)** - Modelo económico
   - Modelo de ingresos
   - Costos operacionales
   - Punto de equilibrio
   - Escala a multi-municipio
   - Proyecciones financieras
   
   **Leer si**: Necesitas entender cómo gana dinero la plataforma.

3. **[actores.md](actores.md)** - Quiénes son los usuarios
   - Cliente (perfil, motivaciones, restricciones)
   - Comercio (tipos, ciclo de vida)
   - Domiciliario (tipos, protecciones)
   - Admin (roles, acceso)
   
   **Leer si**: Necesitas entender quién usa el sistema y por qué.

### Especificación de Funcionalidad

4. **[casos-de-uso.md](casos-de-uso.md)** - Interacciones principales
   - Casos de uso por actor
   - Flujos principales y alternativos
   - Postcondiciones
   - Reglas de negocio específicas
   
   **Leer si**: Necesitas entender qué hace exactamente el sistema.

5. **[flujo-whatsapp.md](flujo-whatsapp.md)** - Experiencia del cliente
   - Estados de conversación
   - Ejemplo completo paso a paso
   - Flujos alternativos
   - Edge cases
   - Restricciones
   
   **Leer si**: Eres UX designer o necesitas implementar chatbot.

6. **[flujo-restaurantes.md](flujo-restaurantes.md)** - Experiencia del comercio
   - Registro rápido (5 minutos)
   - Gestión de pedidos
   - Actualización de precios/horarios
   - Flujos alternativos
   
   **Leer si**: Trabajas en experiencia de comercios.

7. **[flujo-domiciliarios.md](flujo-domiciliarios.md)** - Experiencia del domiciliario
   - Onboarding
   - Aceptación/rechazo de pedidos
   - Entrega y confirmación
   - Ingresos y liquidación
   - Incentivos
   
   **Leer si**: Trabajas en experiencia de domiciliarios.

8. **[flujo-pagos.md](flujo-pagos.md)** - Sistema de pagos
   - Integración con Wompi
   - Dinero en escrow
   - Distribución de fondos
   - Reembolsos y disputas
   - Auditoría
   
   **Leer si**: Trabajas en pagos/finanzas.

### Lógica de Negocio

9. **[estados-pedido.md](estados-pedido.md)** - Máquina de estados
   - Diagrama de estados
   - Descripción de cada estado
   - Transiciones válidas
   - Datos capturados
   - No-funcionales
   
   **Leer si**: Eres backend engineer o necesitas entender el ciclo completo.

10. **[reglas-negocio.md](reglas-negocio.md)** - Las "leyes" del sistema
    - Validaciones
    - Límites y cuotas
    - Aceptación/rechazo
    - Personalización
    - Devoluciones y disputas
    - Comisiones
    - Horarios y cobertura
    - Seguridad y fraude
    - Compliance
    - Escalación
    - Auditoría
    
    **Leer si**: Necesitas saber qué está permitido y qué no.

### Datos y Catálogos

11. **[productos.md](productos.md)** - Gestión de productos
    - Definición de producto
    - Ciclo de vida
    - Categorías
    - Stock e inventario
    - Precio y variantes
    - Atributos especiales
    - Búsqueda
    - Sincronización
    - Auditoría
    
    **Leer si**: Trabajas en catálogos o búsqueda.

12. **[catalogos.md](catalogos.md)** - Estructura de catálogos
    - Organización por comercio
    - Creación automática
    - Búsqueda en catálogo
    - Sincronización
    - Visibilidad
    - Problemas comunes
    
    **Leer si**: Trabajas en experiencia de catalogo.

13. **[personalizaciones.md](personalizaciones.md)** - Customización de productos
    - Tipos de personalización
    - Flujo completo
    - Restricciones
    - Costo dinámico
    - Validaciones de IA
    - Edge cases
    
    **Leer si**: Trabajas en búsqueda o carrito de compras.

### Inteligencia Artificial

14. **[ia.md](ia.md)** - IA en DomiExpress
    - Visión de IA
    - Casos de uso (7 principales)
    - Modelos específicos
    - Limitaciones actuales
    - Privacy
    - Roadmap de IA
    - Costos
    
    **Leer si**: Trabajas en IA/ML o necesitas entender cómo funciona la búsqueda.

### Expansión y Operaciones

15. **[municipios.md](municipios.md)** - Modelo multi-municipio
    - Definición de municipio
    - Ciclo de vida
    - Datos por municipio
    - Configuración
    - Métricas
    - Problemas comunes
    - Cierre (excepcional)
    
    **Leer si**: Trabajas en expansión o operaciones.

16. **[roadmap.md](roadmap.md)** - Plan de desarrollo
    - Fase 1: MVP Timbío (Enero-Marzo 2024)
    - Fase 2: Consolidación (Abril-Junio)
    - Fase 3: Expansión (Julio-Diciembre)
    - Fase 4: Escala nacional (2025)
    - Fase 5: Ecosistema (2026+)
    - Métricas de progreso
    
    **Leer si**: Necesitas entender el plan de desarrollo.

---

## 🗂️ Estructura de Lectura Recomendada

### Para Product Managers
1. vision.md
2. arquitectura-negocio.md
3. casos-de-uso.md
4. flujo-whatsapp.md
5. reglas-negocio.md
6. roadmap.md

### Para Architects (Software)
1. vision.md
2. arquitectura-negocio.md
3. actores.md
4. casos-de-uso.md
5. estados-pedido.md
6. reglas-negocio.md
7. municipios.md

### Para Backend Engineers
1. casos-de-uso.md
2. estados-pedido.md
3. reglas-negocio.md
4. flujo-pagos.md
5. productos.md
6. ia.md

### Para Frontend/UX Designers
1. vision.md
2. actores.md
3. flujo-whatsapp.md
4. flujo-restaurantes.md
5. flujo-domiciliarios.md
6. personalizaciones.md

### Para DevOps/Infrastructure
1. arquitectura-negocio.md (costos)
2. municipios.md (multi-tenancy)
3. reglas-negocio.md (scaling rules)
4. roadmap.md (timeline)

---

## 🎯 Cómo Usar Esta Documentación

### Para Entender el Sistema Completo
```
1. Lee vision.md (5 min)
2. Lee arquitectura-negocio.md (10 min)
3. Lee actores.md (10 min)
4. Lee casos-de-uso.md (15 min)
5. Lee estados-pedido.md (10 min)
6. Regresa a cualquier otro documento según necesidad

Tiempo total: ~45 minutos para visión completa
```

### Para Implementar una Feature
```
1. Identifica qué actor/flujo afecta
2. Lee caso-de-uso.md para ese actor
3. Lee flujo-X.md para ese flujo específico
4. Lee estados-pedido.md si afecta estados
5. Lee reglas-negocio.md para restricciones
6. Busca en otros documentos según necesidad
```

### Para Revisar una Decisión Técnica
```
1. Lee relevante caso-de-uso.md
2. Lee reglas-negocio.md
3. Consulta con PM y arquitecto
4. Actualiza documentación si hay cambio
```

---

## 📝 Convenciones de Este Documento

### Niveles de Detalle

Cada documento tiene 3 niveles:

**Nivel 1**: Resumen ejecutivo (top section)
- Léelo primero si tienes prisa
- ~2 minutos

**Nivel 2**: Descripción detallada (middle sections)
- Léelo si necesitas entender completamente
- ~10 minutos

**Nivel 3**: Edge cases y ejemplos (bottom sections)
- Léelo si necesitas implementar
- ~10+ minutos

### Formato

- **Bold**: Conceptos clave
- `code`: Datos, campos, funciones
- `→`: Transiciones o flujos
- `✓/❌`: Validaciones o permitido/prohibido
- Tablas: Matrices de datos
- Diagramas ASCII: Visuales

### Links

Links internos: `[documento.md](documento.md)`
Links a secciones: `[Estados del Pedido](estados-pedido.md#estados-finales-terminal)`

---

## ⚠️ Lo Que FALTA (Etapas 2-4)

Esta es la documentación de **ETAPA 1** (especificación funcional).

Los siguientes documentos se crearán en etapas posteriores:

### Etapa 2: Arquitectura Técnica
- `arquitectura-tecnica.md`
- `eventos.md`
- `integraciones.md`
- `seguridad.md`
- `observabilidad.md`

### Etapa 3: Diseño de Base de Datos
- `database-design.md`
- `erd.md`
- `indices.md`
- `migrations.md`

### Etapa 4: Implementación
- Por cada fase: plan de implementación detallado
- Endpoints API
- DTOs
- Tests
- Swagger specs

---

## 🤝 Cómo Contribuir a Esta Documentación

### Cambios Pequeños
1. Edita el documento relevante
2. Actualiza links si es necesario
3. Commit con mensaje descriptivo

### Cambios Grandes
1. Propón el cambio en discusión del equipo
2. Actualiza documentación
3. Actualiza links y referencias cruzadas
4. Pide revisión de producto/arquitecto

### Agregar Nuevo Documento
1. Crea archivo con nombre descriptivo (kebab-case)
2. Sigue estructura de otros documentos
3. Agrega link a este README
4. Pide revisión

---

## 📊 Estadísticas de Documentación

```
Documentos: 17
Palabras totales: ~50,000
Casos de uso detallados: 10+
Ejemplos incluidos: 50+
Diagramas: 15+
Tablas de referencia: 30+

Tiempo de lectura:
  - Rápida (solo resúmenes): ~30 minutos
  - Completa (para role específico): ~2-4 horas
  - Exhaustiva (todos los documentos): ~8-10 horas
```

---

## ✅ Checklist de Verificación

Antes de proceder a ETAPA 2, asegúrate de que:

- [ ] He leído los documentos relevantes a mi rol
- [ ] Entiendo los casos de uso principales
- [ ] Entiendo los actores y motivaciones
- [ ] Entiendo los estados y transiciones
- [ ] Entiendo las reglas de negocio
- [ ] He identificado ambigüedades o preguntas
- [ ] He compartido feedback con el equipo

---

## 🚀 Próximos Pasos

1. **Revisión de equipo** (1-2 semanas)
   - Product: ¿Faltan requisitos?
   - Arquitecto: ¿Es escalable?
   - Diseñador: ¿Es usable?
   - Ingeniero: ¿Es implementable?

2. **Ajustes** (basado en feedback)
   - Clarificar ambigüedades
   - Ampliar secciones débiles
   - Validar supuestos

3. **ETAPA 2: Arquitectura Técnica**
   - Diagrama de componentes
   - Flujo de eventos
   - Integraciones
   - Base de datos

4. **ETAPA 3: Diseño de Base de Datos**
   - ERD
   - Entidades
   - Relaciones
   - Índices

5. **ETAPA 4: Desarrollo**
   - Dividir en fases independientes
   - Implementar en paralelo
   - Testing exhaustivo
   - Deployment

---

## 💬 Preguntas Frecuentes

**P: ¿Necesito leer TODA la documentación?**
R: No. Lee según tu rol. Luego profundiza en documentos específicos según necesidad.

**P: ¿Qué pasa si encuentro un error?**
R: Reporta inmediatamente. Ambigüedades = riesgo técnico.

**P: ¿Puedo hacer cambios a la documentación?**
R: Sí, pero propón primero si es cambio grande.

**P: ¿Cuándo empezamos a codificar?**
R: Cuando la ETAPA 1 está 100% aprobada. NO antes.

**P: ¿Necesito hacer una copia para mí?**
R: No. Esta es la fuente única de verdad. Úsala como referencia.

---

## 📧 Contacto

Preguntas sobre documentación: Abre issue o comenta en PR.

Preguntas sobre decisiones de producto: Habla con PM.

Preguntas sobre arquitectura técnica: Habla con Architect.

---

**Última actualización**: Enero 15, 2024

**Estado**: ✅ ETAPA 1 COMPLETA

**Próxima revisión**: Enero 22, 2024 (feedback del equipo)

---

Bienvenido a DomiExpress. 🚀
