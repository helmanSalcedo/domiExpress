# Casos de Uso

## Convenciones

Cada caso de uso sigue este formato:

```
### USE-XXX: Nombre Descriptivo

**Actor Principal**: Quién inicia la acción

**Precondiciones**: Qué debe ser verdad antes

**Flujo Principal**: Pasos feliz path

**Flujos Alternativos**: Casos edge

**Postcondiciones**: Qué es verdad después

**Reglas de Negocio**: Restricciones

**No-funcionales**: Performance, seguridad, etc.
```

---

## Cliente

### USE-CLI-001: Realizar Compra en Múltiples Comercios

**Actor Principal**: Cliente

**Precondiciones**:
- Cliente tiene WhatsApp instalado.
- Está dentro del municipio de cobertura (Timbío).
- Tiene saldo de Wompi o tarjeta vigente (si paga online).

**Flujo Principal**:

1. Cliente escribe mensaje natural en WhatsApp: `"Quiero una hamburguesa sin tomate, una pizza hawaiana y una Coca-Cola"`
2. Backend IA procesa:
   - Identifica productos (hamburguesa, pizza, Coca-Cola).
   - Identifica restricciones (sin tomate).
   - Categoriza (restaurante/comida rápida).
3. Sistema busca todos comercios que venden esos productos.
4. Responde: `"Encontré 5 hamburguesas sin tomate en 3 restaurantes, 4 pizzas hawaianas en 2 restaurantes, 12 Coca-Cola en 8 tiendas. ¿Cuál prefieres?"`
5. Cliente selecciona hamburguesa de "Burguerking", pizza de "Pizzalandia", Coca-Cola de "Tienda Don Pepe".
6. Sistema agrupa pedido:
   - Pedido 1 (Burguerking): 1 hamburguesa sin tomate.
   - Pedido 2 (Pizzalandia): 1 pizza hawaiana.
   - Pedido 3 (Don Pepe): 1 Coca-Cola.
7. Cliente revisa precios totales.
8. Cliente paga vía Wompi.
9. Sistema genera 3 pedidos en paralelo:
   - Notifica cada comercio.
   - Asigna domiciliarios.
10. Cliente recibe actualizaciones de estado en tiempo real.

**Flujos Alternativos**:

- **ALT-1**: Comercio rechaza pedido por agotamiento.
  - Sistema ofrece alternativa: "Burguerking no tiene hamburguesa sin tomate, ¿te interesa con tomate?"
  - Cliente aprueba o rechaza.

- **ALT-2**: Cliente personaliza más.
  - "La hamburguesa que sea con queso cheddar y sin tomate, con doble carne."
  - IA envía especificación al comercio con el pedido.

- **ALT-3**: Cliente cambia de opinión antes del pago.
  - Puede eliminar un comercio.
  - Puede agregar otro.
  - Vuelve a revisar total.

- **ALT-4**: Sistema no entiende el mensaje.
  - IA pide aclaración: "¿Cuántos hamburguesa? ¿Qué tipo de hamburguesa?"
  - Si 3 intentos fallan, escalada a humano.

**Postcondiciones**:
- 3 pedidos creados y confirmados.
- Pagos procesados.
- Comercios notificados.
- Domiciliarios asignados.
- Cliente tiene tracking en tiempo real.

**Reglas de Negocio**:
- No puede haber pedidos a comercios cerrados (validar horario).
- Cantidad máxima por pedido: 50 unidades.
- Precio máximo por pedido: $5,000,000.
- Cliente debe tener ID verificado (teléfono + ubicación).

**No-funcionales**:
- Latencia IA: <3 segundos.
- Confirmación de pedido: <5 segundos.
- Notificación a comercio: <10 segundos.

---

### USE-CLI-002: Compartir Ubicación y Recibir Entrega

**Actor Principal**: Cliente

**Precondiciones**:
- Cliente tiene pedido confirmado y pagado.
- Está en el municipio.

**Flujo Principal**:

1. Sistema pide: "¿Cuál es tu ubicación de entrega?"
2. Cliente comparte ubicación por WhatsApp.
3. Sistema valida:
   - Está dentro de cobertura.
   - Distancia estimada a comercios.
   - Tiempo de entrega.
4. Sistema asigna domiciliario más cercano al comercio origen.
5. Domiciliario recibe notificación: "Pedido de $45,000 a Don Juan Flores (3 cuadras)".
6. Domiciliario acepta.
7. Sistema notifica cliente: "Tu domiciliario está en camino (llega en 8 min)".
8. Cliente ve mapa en tiempo real (link de WhatsApp Maps).
9. Domiciliario llega a comercio, recibe pedido.
10. Domiciliario va a ubicación del cliente.
11. Cliente es alertado: "Domiciliario a 2 minutos".
12. Domiciliario llega, toma foto de entrega.
13. Requiere código de confirmación (PIN de 4 dígitos).
14. Cliente da código.
15. Entrega completada.
16. Cliente califica: ⭐⭐⭐⭐⭐ (1-5 estrellas).

**Flujos Alternativos**:

- **ALT-1**: Cliente no está en ubicación compartida.
  - Sistema intenta llamada (WhatsApp).
  - Si no contesta en 10 min, domiciliario regresa.
  - Pedido se cancela, se reembolsa.

- **ALT-2**: Domiciliario no puede llegar.
  - Toma foto y notifica.
  - Sistema ofrece 3 opciones al cliente:
    1. Enviar dinero por Wompi al domiciliario para que deje en punto seguro.
    2. Reagendar entrega.
    3. Cancelar y reembolso.

- **ALT-3**: Cliente está fuera de rango de cobertura en momento de entrega.
  - Sistema valida ubicación en tiempo real.
  - Si está fuera, cancela entrega.
  - Reembolso automático.

**Postcondiciones**:
- Producto entregado.
- Domiciliario con pago confirmado.
- Cliente calificó experiencia.
- Datos capturados para análisis.

**Reglas de Negocio**:
- Tiempo máximo de espera: 30 minutos (después se cancela).
- PIN de confirmación es obligatorio (seguridad).
- Foto de entrega es obligatoria (auditoría).

**No-funcionales**:
- Ubicación capturada cada 15 segundos durante entrega.
- Foto comprimida a máximo 500KB.

---

### USE-CLI-003: Consultar Histórico y Rependir

**Actor Principal**: Cliente

**Precondiciones**:
- Cliente tiene al menos 1 compra anterior.

**Flujo Principal**:

1. Cliente escribe: "¿Qué compré la última vez?"
2. Sistema responde con últimas 5 compras:
   - Fecha, comercios, productos, total.
3. Cliente escribe: "Repite lo de hace 2 días".
4. Sistema identifica el pedido y lo replica.
5. Pide confirmación de cantidad y precio (puede haber cambiado).
6. Cliente confirma y paga.
7. Nuevo pedido creado idéntico al anterior.

**Flujos Alternativos**:

- **ALT-1**: Producto está agotado.
  - Sistema sugiere similares.
  - Cliente elige o cancela.

- **ALT-2**: Precio cambió significativamente (+20%).
  - Sistema avisa: "Antes pagaste $X, ahora cuesta $Y. ¿Procedes?"

**Postcondiciones**:
- Pedido replicado.
- Cliente ahorró tiempo en describir.
- Datos capturados para predicción.

---

## Comercio

### USE-COM-001: Registrarse en 5 Minutos

**Actor Principal**: Comercio (Dueño/Gerente)

**Precondiciones**:
- Comercio tiene número de WhatsApp.
- Tiene al menos 1 foto del local.
- Tiene catálogo (foto, PDF o mental).

**Flujo Principal**:

1. Dueño abre WhatsApp de DomiExpress y dice: "Registrar comercio".
2. Sistema pide:
   - Nombre: "Pizzalandia"
   - Categoría: "Restaurante" (auto-completa).
   - Teléfono del comercio: "+57 1 2345678" (WhatsApp comercio).
3. Sistema pide compartir ubicación del local (GPS).
4. Sistema pregunta horarios: "¿Qué horarios operas?" 
   - Respuesta: "Lunes a viernes 10AM-10PM, fines de semana 10AM-12AM".
5. Sistema pide fotos del local.
6. Sistema pide catálogo:
   - "¿Tienes PDF de la carta?" O
   - "¿Fotos de productos?" O
   - "¿Prefieres describir?".
7. Dueño comparte PDF de la carta.
8. **Mágia IA**:
   - Extrae texto del PDF (OCR).
   - Identifica categorías (Pizzas, Bebidas, Postres).
   - Identifica productos (Margherita, Hawaiana, etc.).
   - Identifica precios.
   - Identifica ingredientes cuando existan.
9. Sistema responde: "Detecté 28 productos en 4 categorías. ¿Reviso bien?"
10. Dueño revisa lista y corrige errores:
    - "La Hawaiana no lleva piña" (Edita descripción).
    - "Agrega Tamaño (Pequeña, Mediana, Grande)" (Agrega variante).
11. Dueño aprueba.
12. Comercio está **PUBLICADO**.
13. Sistema notifica: "¡Bienvenido a DomiExpress! Empezarás a recibir pedidos en 5 minutos."

**Flujos Alternativos**:

- **ALT-1**: No tiene PDF, solo fotos.
  - Sistema procesa cada foto con IA.
  - Genera catálogo automático.

- **ALT-2**: No tiene fotos.
  - Dueño describe verbalmente.
  - IA genera catálogo básico (texto).
  - Menos attractivo, pero funcional.

- **ALT-3**: Categoría no es estándar.
  - Sistema detecta: "Categorizaste como 'Panadería', ¿es correcto?"
  - Dueño confirma o corrige.

**Postcondiciones**:
- Comercio está publicado.
- Catálogo disponible para búsqueda.
- WhatsApp del comercio registrado.
- Recibe notificaciones de pedidos.

**Reglas de Negocio**:
- Máximo 5 minutos de interacción (user fatigue).
- IA debe tener confianza >85% en extracciones.
- Si confianza <85%, solicita confirmación manual.

**No-funcionales**:
- OCR debe procesar PDF en <3 segundos.
- IA debe generar catálogo en <5 segundos.

---

### USE-COM-002: Gestionar Pedidos Entrantes

**Actor Principal**: Comercio

**Precondiciones**:
- Comercio está publicado.
- Recibe pedido.

**Flujo Principal**:

1. Comercio recibe notificación en WhatsApp:
   ```
   🎯 NUEVO PEDIDO
   Cliente: Juan García
   Ubicación: Cra 5 #3-45
   Pedido: 1x Hamburguesa sin tomate, 1x Coca-Cola
   Total: $45,000
   
   ✅ ACEPTAR
   ❌ RECHAZAR
   ```
2. Comercio revisa inventario.
3. Si tiene todo, toca "✅ ACEPTAR".
4. Sistema notifica cliente: "Tu pedido fue aceptado. Se prepara en 15 minutos".
5. Comercio prepara pedido.
6. Cuando está listo, envía foto con código de barras (QR/PIN).
7. Domiciliario escanea y recoge.

**Flujos Alternativos**:

- **ALT-1**: Producto agotado.
  - Comercio toca "❌ RECHAZAR".
  - Sistema comunica al cliente: "Desafortunadamente, la Coca-Cola está agotada. ¿Quieres Fanta?"

- **ALT-2**: Comercio necesita más tiempo.
  - Envía mensaje: "Listo en 20 minutos".
  - Sistema extiende ETA del domiciliario.

- **ALT-3**: Pedido tiene muchas customizaciones.
  - Sistema envía nota: "Hamburguesa sin cebolla, con queso cheddar, doble carne".

**Postcondiciones**:
- Pedido aceptado o rechazado.
- Cliente notificado.
- Flujo continúa.

**Reglas de Negocio**:
- Comercio tiene 60 segundos para responder.
- Si no responde, sistema lo considera rechazado.
- Rechazar >3 pedidos por hora activa suspensión (antifraude).

---

### USE-COM-003: Actualizar Precios y Horarios

**Actor Principal**: Comercio

**Precondiciones**:
- Comercio está publicado.

**Flujo Principal**:

1. Comercio escribe: "Cambiar horario".
2. Sistema pregunta: "¿Qué horarios tienes hoy?"
3. Comercio responde: "10AM-4PM" (hoy es feriado).
4. Sistema actualiza instantáneamente.
5. Clientes que busquen después de 4PM no ven este comercio.

**Alternativa: Cambiar Precio**:

1. Comercio escribe: "Actualizar precio Hamburguesa a $35,000".
2. Sistema confirma: "¿Cambiar Hamburguesa de $40,000 a $35,000?"
3. Comercio confirma.
4. Sistema actualiza **solo para nuevos pedidos** (no retroactivo).

**Postcondiciones**:
- Datos actualizados en tiempo real.
- Clientes ven cambios inmediatamente.

**Reglas de Negocio**:
- Cambios de precio no afectan pedidos abiertos.
- Cambios de horario son inmediatos.

---

## Domiciliario

### USE-DOM-001: Aceptar y Completar Entrega

**Actor Principal**: Domiciliario

**Precondiciones**:
- Domiciliario está en aplicación DomiYa Driver.
- Hay pedidos disponibles en su zona.
- Está registrado y activo.

**Flujo Principal**:

1. Sistema notifica: "Pedido de Burguerking a 200 metros. Pagará $3,500. ¿Aceptas?"
2. Domiciliario toca "✅ ACEPTAR".
3. Sistema navega a Burguerking.
4. Llega, toma foto de recepción.
5. Escanea código QR/PIN del pedido.
6. Sistema lo navega a ubicación del cliente.
7. Llega al cliente.
8. Toma foto de entrega (con cliente visible si es posible).
9. Requiere PIN de confirmación del cliente.
10. Cliente envía PIN.
11. Domiciliario confirma entrega.
12. Pago de $3,500 se acredita a domiciliario.

**Flujos Alternativos**:

- **ALT-1**: Domiciliario rechaza.
  - Sistema busca otro domiciliario.
  - El primero no sufre penalización.

- **ALT-2**: Cliente no está en ubicación.
  - Domiciliario intenta llamar (WhatsApp).
  - Si no contesta en 10 minutos, puede abandonar entrega.
  - Se activa ALT de USE-CLI-002.

- **ALT-3**: Distancia es mayor a lo estimado.
  - Sistema recompensa con bonus (1.2x pago).

**Postcondiciones**:
- Entrega completada.
- Dinero acreditado.
- Calificaciones capturadas.
- Datos de ubicación guardados.

**Reglas de Negocio**:
- Aceptación dentro de 60 segundos o pierde la oferta.
- Debe completar en tiempo estimado ±15 minutos.
- Rating <3.5 => suspensión.

---

## Administración

### USE-ADM-001: Crear Nuevo Municipio

**Actor Principal**: Admin

**Precondiciones**:
- Admin tiene acceso al panel de administración.
- Municipio tiene datos básicos (población, coordenadas).

**Flujo Principal**:

1. Admin va a: `admin.domiexpress.app/municipios/nuevo`.
2. Llena formulario:
   - Nombre: "Timbío".
   - Departamento: "Cauca".
   - Coordenadas: GPS del centro.
   - Población: 12,000.
   - Radio de cobertura: 5 km.
   - Número WhatsApp: +57 3001234567.
3. Admin carga datos:
   - Logo municipio.
   - Descripción.
   - Horarios globales.
4. Sistema valida y crea municipio.
5. Municipio está **EN PREPARACIÓN** (no publicado).
6. Admin invita comercios piloto vía CSV.
7. Sistema envía invitaciones.
8. Cuando 20+ comercios estén activos, admin publica.
9. Municipio está **LIVE** (aceptar clientes).

**Postcondiciones**:
- Municipio existe en BD.
- WhatsApp asociado.
- Listo para recibir registros.

---

### USE-ADM-002: Suspender Comercio por Fraude

**Actor Principal**: Admin

**Precondiciones**:
- Comercio cometió infracción (ofertas falsas, cobros indebidos, etc.).

**Flujo Principal**:

1. Admin va a: `admin.domiexpress.app/comercios/[id]`.
2. Ve historial de quejas.
3. Determina que necesita suspensión.
4. Toca "Suspender".
5. Sistema:
   - Desactiva el comercio.
   - Notifica comercio: "Has sido suspendido por [razón]. Apela en 48h".
   - Notifica clientes: "Este comercio no está disponible".
   - Rechaza automáticamente pedidos nuevos.
6. Comercio tiene 48 horas para apelar.
7. Admin revisa apelación y restaura o confirma.

**Postcondiciones**:
- Comercio no recibe pedidos.
- Datos se preservan (auditoría).

---

## Matriz de Casos de Uso

| Actores | Crear | Operar | Consultar | Reportar | Escalar |
|---------|-------|--------|-----------|----------|---------|
| **Cliente** | Pedido | Recibir | Histórico | Problema | Soporte |
| **Comercio** | Catálogo | Pedidos | Ventas | Chargeback | Soporte |
| **Domiciliario** | Disponibilidad | Entrega | Ingresos | Accidente | Soporte |
| **Admin** | Municipio | Verificación | Reporte | Fraude | Escalada |

---

**Propósito de este documento**: Documentar cada interacción del sistema con detalle. Estos casos de uso serán la base de endpoints API, eventos y flujos de negocio.
