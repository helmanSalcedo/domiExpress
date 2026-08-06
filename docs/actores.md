# Actores del Sistema

## 1. Cliente

### Definición

Persona natural que solicita productos mediante WhatsApp. Puede ser:
- Residente del municipio.
- Trabajador/estudiante visitante.
- Persona sin regularidad en compras (ocasional).

### Características Demográficas

- **Edad**: 18-70 años (aunque sistema soporta menores con consentimiento).
- **Educación**: Primaria a Superior (sistema debe funcionar para ambos).
- **Tecnología**: Teléfono con WhatsApp (no es requisito smartphone moderno).
- **Acceso**: Internet básico (no requiere data plan robusta).

### Motivaciones

- **Comodidad**: No desea salir de casa/trabajo.
- **Velocidad**: Necesita el producto rápido (urgencias).
- **Ahorro**: Compra a mejor precio buscando entre comercios.
- **Variedad**: Acceso a todo lo del municipio en un chat.
- **Seguridad**: Transacciones audibles y trazables.

### Comportamientos Esperados

#### Uso Ocasional (30% de usuarios)
- 1-2 compras/semana.
- Pedidos pequeños ($20,000-50,000).
- No personaliza preferencias.
- Alto churn (abandona si experimenta fricción).

#### Uso Regular (50% de usuarios)
- 4-7 compras/semana.
- Pedidos medianos ($40,000-100,000).
- Tiene preferencias por comercios.
- Bajo churn, sensible a promociones.

#### Poder de Compra (20% de usuarios)
- 10+ compras/semana.
- Pedidos grandes ($150,000+).
- Compra en múltiples comercios simultáneamente.
- Muy sensible a mejor precio.

### Restricciones y Limitaciones

- **No tiene app**: Interacción 100% por WhatsApp.
- **Banda ancha limitada**: No puede descargar 10MB de imágenes.
- **Atención limitada**: Lee en contexto de chat familiar/laboral.
- **Paciencia limitada**: Si IA no entiende a la 3ª vez, abandona.

### Ciclo de Vida

1. **Descubrimiento**: Escucha de un amigo o ve publicidad.
2. **Primer contacto**: Envía mensaje al WhatsApp de DomiExpress.
3. **Onboarding**: IA lo saluda y explica brevemente qué hacer.
4. **Primer pedido**: Cliente busca productos, IA recomienda comercios.
5. **Checkout**: Cliente revisa precio, paga (Wompi), comparte ubicación.
6. **Entrega**: Seguimiento en tiempo real.
7. **Fulfillment**: Recibe producto.
8. **Post-compra**: Califica experiencia, recibe promociones.

### Datos que Capturamos

- Nombre, teléfono, email (opcional).
- Ubicación (compartida en cada pedido).
- Historial de compras (productos, comercios, precios).
- Preferencias (sin tomate, sin cebolla, etc.).
- Métodos de pago registrados.
- Calificaciones y reseñas.
- Horarios de compra (patrones).

**Protección**: Cumplimos GDPR-like standards. El cliente es dueño de sus datos.

---

## 2. Comercio

### Definición

Negocio formal o informal que vende productos. Puede ser de cualquier categoría autorizada.

### Categorías Soportadas

| Categoría | Ejemplos | Peculiaridades |
|-----------|----------|-----------------|
| **Restaurante** | Comida rápida, pizzería, parrilla | Horarios específicos, tiempo de preparación |
| **Tienda de Barrio** | Abarrotes, snacks, bebidas | Inventario limitado, bajo ticket promedio |
| **Supermercado** | Autoservicio, multiproducto | Alto volumen, inventario variable |
| **Droguería** | Medicamentos, cosméticos | Restricciones legales en venta |
| **Licorera** | Bebidas alcohólicas | Restricción de edad, horarios legales |
| **Veterinaria** | Alimentos para mascotas, servicios | Servicios además de productos |
| **Ferretería** | Materiales construcción, herramientas | Productos pesados, consultoría de cliente |
| **Panadería** | Pan, pasteles, café | Productos frescos, horarios específicos |
| **Floristería** | Flores, arreglos, plantas | Customización alta, entregas ceremoniales |

### Características Operacionales

#### Pequeño (~$1,000,000/mes en ventas)
- 1-3 empleados.
- Inventario <500 SKUs.
- 20-50 pedidos/día máximo.
- Gestión manual o spreadsheet.
- No tienen sistema POS.

#### Mediano (~$10,000,000/mes)
- 5-20 empleados.
- Inventario 500-2,000 SKUs.
- 100-300 pedidos/día.
- Sistema POS básico.
- Pueden integrar APIs.

#### Grande (>$50,000,000/mes)
- 50+ empleados.
- Inventario 2,000+ SKUs.
- 1,000+ pedidos/día.
- Sistema POS avanzado, BI.
- Quieren integración profunda.

### Motivaciones

- **Crecimiento de ingresos**: +20% en ventas con DomiExpress.
- **Datos de clientes**: Emails, teléfonos, preferencias.
- **Información de mercado**: Qué venden, a qué precio, competencia.
- **Eficiencia**: Menos trabajo manual en gestión de pedidos.
- **Actualidad**: Estar en la plataforma del municipio.

### Restricciones

- **Horarios**: No puede operar 24/7 (tiene horario de negocio).
- **Capacidad**: No puede preparar 100 pedidos simultáneamente.
- **Inventario**: Agotamiento de productos es realidad.
- **Métodos de pago**: No todos aceptan tarjeta (algunos solo efectivo).

### Ciclo de Vida

1. **Conciencia**: Escucha de DomiExpress de otro comercio o cliente.
2. **Interés**: Quiere aumentar ventas.
3. **Evaluación**: Compara con costo vs. beneficio.
4. **Registro**: Rápido onboarding (5 minutos).
5. **Setup**: Carga productos y horarios.
6. **Primer pedido**: Recibe notificación, gestiona en WhatsApp.
7. **Optimización**: Ajusta horarios, precios, inventario.
8. **Escala**: Aumenta presencia, integra sistemas.

### Datos que Capturamos

- Razón social, NIT, teléfono.
- Ubicación exacta (GPS).
- Horarios operacionales.
- Logo, fotos de local.
- Catálogo de productos.
- Aceptación de métodos de pago.
- Rating de clientes.
- Ingresos por DomiExpress.

**Privacidad**: El comercio es dueño de su data. DomiExpress la usa solo para mejorar servicio.

### Reglas de Negocio Específicas

- **Rechazo de pedidos**: Comercio puede rechazar por agotamiento/capacidad.
- **Modificación de precios**: Se permiten pero no retroactivas a pedidos abiertos.
- **Horarios**: Fuera de horarios, no aparece en búsqueda.
- **Suspensión**: Se suspende si comete fraude (ofertas falsas, cobros indebidos).
- **Reporte**: Acceso diario a métricas de pedidos.

---

## 3. Domiciliario

### Definición

Persona que acepta y ejecuta entregas a domicilio. No es empleado formal de DomiExpress, es socio independiente.

### Características

- **Edad**: 18-70 años (requisito legal de mayoría de edad).
- **Documentación**: Cédula válida, carnet de conducir o pasado de referencias.
- **Vehículo**: Bicicleta, moto, carro (cada municipio tiene requisitos).
- **Cobertura**: Opera dentro de límites geográficos definidos.
- **Disponibilidad**: Flexible (puede trabajar 4h o 12h/día).

### Motivaciones

- **Ingresos**: Ganancia variable según pedidos completados.
- **Flexibilidad**: Elige sus horas de trabajo.
- **Seguridad**: Trabajo sin explotación, ingresos garantizados.
- **Reconocimiento**: Ratings y reputación.
- **Estabilidad**: No puede ser despedido arbitrariamente.

### Tipos de Domiciliario

#### En Bicicleta (40%)
- Costo de entrada: ~$50,000 (bici usada).
- Rango de cobertura: 2-5 km.
- Capacidad: 3-5 pedidos/hora.
- Ingresos: $45,000-60,000/día.
- Segmento: Estudiantes, jóvenes, amas de casa.

#### En Moto (50%)
- Costo de entrada: ~$1,000,000 (moto usada).
- Rango de cobertura: 5-15 km.
- Capacidad: 6-10 pedidos/hora.
- Ingresos: $60,000-100,000/día.
- Segmento: Trabajadores establecidos, con experiencia.

#### En Carro (10%)
- Costo de entrada: ~$5,000,000 (carro usado).
- Rango de cobertura: 10-30 km.
- Capacidad: 8-15 pedidos/hora.
- Ingresos: $100,000-150,000/día.
- Segmento: Operadores profesionales, emprendedores.

### Ciclo de Vida

1. **Aplicación**: Envía información a DomiExpress.
2. **Verificación**: Backend valida documentación, referencias.
3. **Onboarding**: Capacitación sobre app, rutas, seguridad.
4. **Primer turno**: Acepta pedidos en horario pico.
5. **Calificación**: Comunidad lo califica (seguridad, velocidad).
6. **Escalón**: Sube de nivel según performance.
7. **Ingresos**: Recibe liquidación diaria o semanal.

### Datos que Capturamos

- Nombre, documentación, contacto de emergencia.
- Tipo de vehículo, placa, seguro.
- Ubicación en tiempo real (durante turnos).
- Historial de entregas completadas.
- Rating de clientes y comercios.
- Ingresos acumulados.
- Horarios de disponibilidad.

**Seguridad**: Datos encriptados. Ubicación real se oculta a otros.

### Reglas de Negocio

- **Aceptación**: Debe aceptar o rechazar dentro de 60 segundos.
- **Tiempo de entrega**: Estimado según distancia, debe cumplirlo.
- **Reporte**: Si hay incidente (accidente, robo), reporta inmediatamente.
- **Calificación**: Si cae <4.0/5.0, se investiga; si cae <3.5, se suspende.
- **Documentación**: Debe mantener seguro vigente (si es obligatorio).

### Protecciones

- **Seguro**: DomiExpress cubre accidentes durante turno.
- **Ingresos mínimos**: Garantiza $40,000/día incluso en días lentos (primeras 100 entregas).
- **Soporte legal**: Asesoría en caso de accidente o conflicto.
- **Equipo**: Poder comprar uniforme/casco a costo de socio.

---

## 4. Admin/Operaciones (Persona Interna)

### Rol

Equipo interno de DomiExpress que gestiona:
- Municipios (crear, pausar, cerrar).
- Comercios (verificación, suspensión).
- Domiciliarios (onboarding, resolución de conflictos).
- Finanzas (liquidaciones, auditoría).
- Soporte (escalaciones).

### Acceso al Sistema

- Panel administrativo web (no WhatsApp).
- Acceso a base de datos completa.
- Capacidad de suspender/resolver conflictos.
- Reportes y analytics.

### Restricciones

- No puede ver datos sensibles (passwords, tokens).
- Todas las acciones se auditan.
- Escalaciones de nivel superior requieren aprobación.

---

## Matriz de Interacciones

| De → A | Cliente | Comercio | Domiciliario |
|--------|---------|----------|--------------|
| **Cliente** | Referidos | Compra | Calificación |
| **Comercio** | Venta | Coordinación | Envío |
| **Domiciliario** | Entrega | Recoge pedido | Coordinación |

---

**Propósito de este documento**: Entender profundamente quién usa el sistema, qué quiere y cuáles son sus limitaciones. Todas las decisiones de UX y API deben ser coherentes con estos perfiles.
