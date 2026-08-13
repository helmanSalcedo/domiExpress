# 🚀 Chatbot - Guía de Inicio Rápido

## ✅ Ya está instalado todo

El módulo chatbot ya está completamente implementado y listo para usar. Solo necesitas ejecutar estos pasos:

## 1️⃣ Instalar dependencias

```bash
npm install
```

Esto instalará:
- `@nestjs/websockets` - Para WebSocket en tiempo real
- `socket.io` - Cliente/servidor WebSocket
- Las demás dependencias existentes

## 2️⃣ Configurar variables de entorno

El archivo `.env.example` ya tiene las variables necesarias. Solo verifica:

```bash
# .env (copia de .env.example)

# ✅ Chatbot necesita la API key de Claude
ANTHROPIC_API_KEY="sk-ant-..."  # Tu API key de Anthropic

# ✅ WhatsApp (opcional, para webhook)
WHATSAPP_WEBHOOK_TOKEN="test_token"

# Las demás variables (PostgreSQL, Redis, etc.) ya están configuradas
```

## 3️⃣ Ejecutar migraciones de BD

```bash
# Crear/actualizar las tablas de chatbot
npm run db:migrate

# Ver resultado
npm run db:studio  # Abre Prisma Studio en http://localhost:5555
```

Las migraciones crean:
- **ChatSession** - Sesiones de conversación
- **ChatMessage** - Mensajes individuales

## 4️⃣ Iniciar el servidor

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 5️⃣ Verificar que funciona

```bash
# Health check del chatbot
curl http://localhost:3000/chat/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2024-01-15T10:30:00Z","service":"chatbot"}
```

## 📊 Documentación completa

Consulta los detalles completos en:
```
/src/modules/chatbot/CHATBOT.md
```

## 🔗 Endpoints disponibles

### REST API
- `POST /chat/sessions` - Crear sesión
- `GET /chat/sessions/{id}` - Obtener sesión
- `POST /chat/messages` - Enviar mensaje
- `GET /chat/sessions/{id}/history` - Obtener historial
- `PUT /chat/sessions/{id}/close` - Cerrar sesión
- `GET /chat/health` - Health check

### WebSocket (namespace `/chat`)
- `start_session` - Iniciar sesión
- `send_message` - Enviar mensaje
- `get_history` - Obtener historial
- `end_session` - Cerrar sesión
- `ping` - Verificar conexión

### WhatsApp Webhook
- `GET /whatsapp/webhook` - Verificación (Meta)
- `POST /whatsapp/webhook` - Recibir mensajes

## 💻 Ejemplo: Usar desde cliente

### Opción 1: WebSocket (Tiempo real)

```javascript
// Copiar /src/modules/chatbot/examples/client-websocket.ts
import { ChatbotClient } from './chatbot.client';

const chatbot = new ChatbotClient(
  'customer-123',
  'municipality-456',
  'http://localhost:3000'
);

// Esperar conexión
setTimeout(() => {
  chatbot.sendMessage('¿Hola, cómo estás?');
}, 1000);
```

### Opción 2: REST API (Simple)

```bash
# 1. Crear sesión
curl -X POST http://localhost:3000/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "municipalityId": "municipality-456"
  }'

# 2. Enviar mensaje
curl -X POST http://localhost:3000/chat/messages \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "content": "¿Cuál es el estado de mi pedido?"
  }'

# 3. Obtener historial
curl http://localhost:3000/chat/sessions/SESSION_ID/history?limit=50
```

## 🧪 Ejecutar tests

```bash
# Tests del chatbot
npm run test -- chatbot

# Con cobertura
npm run test:cov -- chatbot

# Watch mode
npm run test:watch -- chatbot
```

## 🔍 Ver logs

```bash
# Los logs aparecerán en la consola:
# [debug] ChatGateway: Client connected: socket-id
# [debug] ClaudeIntegrationService: Claude response processed in 245ms
# [log] ChatbotService: Message processed for customer customer-123
```

## 📱 Integración con WhatsApp

Para recibir mensajes desde WhatsApp:

1. **Configurar webhook en Meta Dashboard:**
   - Callback URL: `https://tu-dominio.com/whatsapp/webhook`
   - Verify Token: (lo que pusiste en `WHATSAPP_WEBHOOK_TOKEN`)
   - Subscribe to: `messages`

2. **El servidor recibirá mensajes como:**
   ```json
   {
     "object": "whatsapp_business_account",
     "entry": [{
       "changes": [{
         "value": {
           "messages": [{
             "from": "34123456789",
             "text": {"body": "¿Hola?"}
           }]
         }
       }]
     }]
   }
   ```

3. **El módulo automáticamente:**
   - Mapea el teléfono a customerId
   - Procesa con Claude
   - Almacena en BD
   - Devuelve respuesta

## 🐛 Troubleshooting

### "Error: ANTHROPIC_API_KEY not set"
```bash
# Solución: Verificar que tienes la variable en .env
ANTHROPIC_API_KEY=sk-ant-...
```

### "WebSocket connection failed"
```bash
# Solución: Verificar que el servidor está corriendo
npm run start:dev

# Verificar puerto
curl http://localhost:3000/chat/health
```

### "Database error"
```bash
# Solución: Verificar migraciones
npm run db:migrate

# Resetear BD (⚠️ DESTRUYE DATOS)
npm run db:reset
```

### "Messages no se guardan"
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Ver logs de la aplicación
npm run start:dev 2>&1 | grep -i chatbot
```

## 📊 Arquitectura

```
Cliente (WebSocket/REST)
         ↓
    API Gateway
    (NestJS)
         ↓
  ChatbotController/Gateway
         ↓
   ChatbotService
         ├─→ ChatSessionService (gestión)
         ├─→ ChatMessageService (almacenamiento)
         └─→ ClaudeIntegrationService (IA)
         ↓
   PostgreSQL (datos persistentes)
   Redis (cache)
```

## 🎯 Estructura de carpetas

```
src/modules/chatbot/
├── controllers/              # REST API
├── gateways/                 # WebSocket
├── services/                 # Lógica de negocio
├── dto/                      # Data Transfer Objects
├── examples/                 # Ejemplos de cliente
├── chatbot.module.ts         # Módulo NestJS
├── index.ts                  # Exports
└── CHATBOT.md               # Documentación completa
```

## ✨ Características incluidas

✅ WebSocket en tiempo real
✅ Integración Claude AI
✅ Almacenamiento de sesiones
✅ Historial de mensajes
✅ Webhook para WhatsApp
✅ REST API
✅ Tests automatizados
✅ Logging detallado
✅ Manejo de errores
✅ Documentación completa

## 🚀 Próximos pasos

1. **Ejecutar migraciones**
   ```bash
   npm run db:migrate
   ```

2. **Iniciar servidor**
   ```bash
   npm run start:dev
   ```

3. **Probar con cURL o cliente**
   ```bash
   curl http://localhost:3000/chat/health
   ```

4. **Revisar documentación**
   ```
   /src/modules/chatbot/CHATBOT.md
   ```

5. **Implementar en tu aplicación**
   - Copiar ejemplo de cliente WebSocket o REST
   - Integrar en tu componente React/Vue/Angular
   - Personalizar prompts si es necesario

## 📞 Soporte

- 📖 Documentación: `/src/modules/chatbot/CHATBOT.md`
- 💾 Base de datos: `/prisma/schema.prisma`
- 🧪 Tests: `/src/modules/chatbot/**/*.spec.ts`
- 📝 Ejemplos: `/src/modules/chatbot/examples/`

---

**¡Listo!** 🎉 El chatbot está completamente implementado y listo para usar.

Cualquier pregunta, revisa la documentación en `CHATBOT.md`.
