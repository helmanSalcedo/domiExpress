# 💬 Módulo Chatbot - DomiExpress

## Descripción

El módulo chatbot proporciona capacidades de chat en tiempo real powered by Claude AI para DomiExpress. Soporta:
- WebSocket para comunicación en tiempo real
- Integración con Claude AI para procesamiento de lenguaje natural
- Webhook para WhatsApp
- Gestión de sesiones de conversación
- Historial de mensajes persistente

## Características

✅ **WebSocket Real-time** - Comunicación bidireccional en tiempo real
✅ **Claude AI Integration** - Procesamiento de NLU con Anthropic Claude
✅ **Session Management** - Gestión automática de sesiones
✅ **Message History** - Almacenamiento persistente de conversaciones
✅ **WhatsApp Webhook** - Integración con WhatsApp Business API
✅ **Context Awareness** - Mantiene contexto de conversación
✅ **Error Handling** - Manejo robusto de errores

## Estructura del Módulo

```
/src/modules/chatbot/
├── controllers/
│   ├── chatbot.controller.ts          # REST API endpoints
│   └── whatsapp-webhook.controller.ts # WhatsApp webhook
├── gateways/
│   └── chat.gateway.ts               # WebSocket gateway
├── services/
│   ├── chatbot.service.ts            # Lógica principal
│   ├── chat-session.service.ts       # Gestión de sesiones
│   ├── chat-message.service.ts       # Almacenamiento de mensajes
│   └── claude-integration.service.ts # Integración Claude
├── dto/
│   ├── create-message.dto.ts
│   ├── chat-session.dto.ts
│   └── whatsapp-webhook.dto.ts
├── chatbot.module.ts                 # Módulo principal
└── CHATBOT.md                        # Este archivo
```

## Entidades de Base de Datos

### ChatSession
```sql
- id (UUID)
- customerId (UUID) - Relación con Customer
- municipalityId (UUID)
- socketId (VARCHAR) - ID del socket.io
- status (ACTIVE, PAUSED, CLOSED)
- context (JSON) - Contexto de conversación
- messageCount (INT)
- lastMessageAt (Timestamp)
- createdAt, updatedAt, closedAt
```

### ChatMessage
```sql
- id (UUID)
- chatSessionId (UUID) - Relación con ChatSession
- role (USER, ASSISTANT, SYSTEM)
- content (TEXT)
- source (WEBSOCKET, WHATSAPP, API)
- messageType (TEXT, ACTION, EVENT)
- tokens (INT) - Tokens usados por Claude
- processingTimeMs (INT)
- metadata (JSON)
- createdAt
```

## API REST Endpoints

### Crear sesión
```http
POST /chat/sessions
Content-Type: application/json

{
  "customerId": "uuid-customer",
  "municipalityId": "uuid-municipality"
}

Response 201:
{
  "id": "uuid-session",
  "customerId": "uuid-customer",
  "municipalityId": "uuid-municipality",
  "status": "ACTIVE",
  "messageCount": 0,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Obtener sesión
```http
GET /chat/sessions/{sessionId}

Response 200:
{
  "id": "uuid-session",
  "customerId": "uuid-customer",
  "status": "ACTIVE",
  "messageCount": 5,
  "lastMessageAt": "2024-01-15T10:35:00Z"
}
```

### Enviar mensaje (REST)
```http
POST /chat/messages
Content-Type: application/json

{
  "customerId": "uuid-customer",
  "content": "¿Cuál es el estado de mi pedido?",
  "source": "WEBSOCKET"
}

Response 200:
{
  "sessionId": "uuid-session",
  "messageId": "uuid-message",
  "response": "Tu pedido #ORD-2024-00123 está en camino...",
  "tokens": 87,
  "processingTimeMs": 245,
  "timestamp": "2024-01-15T10:35:00Z"
}
```

### Obtener historial
```http
GET /chat/sessions/{sessionId}/history?limit=50

Response 200:
{
  "sessionId": "uuid-session",
  "messages": [
    {
      "id": "uuid-msg-1",
      "role": "USER",
      "content": "Hola",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid-msg-2",
      "role": "ASSISTANT",
      "content": "Hola! ¿En qué puedo ayudarte?",
      "createdAt": "2024-01-15T10:30:05Z"
    }
  ]
}
```

### Cerrar sesión
```http
PUT /chat/sessions/{sessionId}/close

Response 200:
{
  "id": "uuid-session",
  "status": "CLOSED",
  "closedAt": "2024-01-15T10:40:00Z"
}
```

## WebSocket Events

### Cliente → Servidor

#### `start_session`
Inicia una nueva sesión de chat
```javascript
socket.emit('start_session', {
  customerId: 'uuid-customer',
  municipalityId: 'uuid-municipality'
});

// Response
socket.on('message', (data) => {
  console.log('Session started:', data.sessionId);
  // {
  //   status: 'success',
  //   sessionId: 'uuid-session',
  //   message: 'Chat session started'
  // }
});
```

#### `send_message`
Envía un mensaje al chatbot
```javascript
socket.emit('send_message', {
  customerId: 'uuid-customer',
  content: '¿Dónde está mi pedido?'
});

// Response
socket.on('message_response', (data) => {
  console.log('Response:', data.data.response);
  // {
  //   status: 'success',
  //   data: {
  //     sessionId: 'uuid-session',
  //     messageId: 'uuid-message',
  //     response: '...',
  //     tokens: 87,
  //     processingTimeMs: 245,
  //     timestamp: '2024-01-15T10:35:00Z'
  //   }
  // }
});
```

#### `get_history`
Obtiene el historial de mensajes
```javascript
socket.emit('get_history', {
  sessionId: 'uuid-session',
  limit: 50
});

// Response
socket.on('message', (data) => {
  console.log('History:', data.data.messages);
});
```

#### `end_session`
Cierra la sesión de chat
```javascript
socket.emit('end_session', {
  sessionId: 'uuid-session'
});

// Response
socket.on('message', (data) => {
  console.log('Session closed');
});
```

#### `ping`
Verificar que la conexión está activa
```javascript
socket.emit('ping');

// Response
socket.on('message', (data) => {
  console.log('Pong:', data.timestamp);
});
```

### Servidor → Cliente

#### `connected`
Se emite cuando el cliente se conecta
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data.socketId);
});
```

#### `message_response`
Respuesta del chatbot
```javascript
socket.on('message_response', (data) => {
  // Ver ejemplo en send_message
});
```

#### `message_received`
Broadcast de mensajes a otros clientes en la misma sesión
```javascript
socket.on('message_received', (data) => {
  console.log('Other client message:', data.response);
});
```

#### `error`
Notificación de error
```javascript
socket.on('error', (data) => {
  console.error('Error:', data.message);
});
```

## Ejemplo: Cliente JavaScript/TypeScript

```typescript
// Conectar al WebSocket
const socket = io('http://localhost:3000/chat', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Configuración inicial
let sessionId: string;
const customerId = 'uuid-customer';
const municipalityId = 'uuid-municipality';

// Evento de conexión
socket.on('connect', () => {
  console.log('Connected to chatbot');
  
  // Iniciar sesión
  socket.emit('start_session', {
    customerId,
    municipalityId,
  });
});

// Evento de desconexión
socket.on('disconnect', () => {
  console.log('Disconnected from chatbot');
});

// Escuchar respuestas del chatbot
socket.on('message_response', (data) => {
  if (data.status === 'success') {
    sessionId = data.data.sessionId;
    console.log('Bot:', data.data.response);
    console.log('Time:', `${data.data.processingTimeMs}ms`);
  }
});

// Función para enviar mensaje
function sendMessage(message: string) {
  if (!sessionId) {
    console.error('Session not started');
    return;
  }

  socket.emit('send_message', {
    customerId,
    content: message,
  });
}

// Uso
sendMessage('¿Hola, cómo estás?');
sendMessage('¿Cuál es el estado de mi pedido?');
```

## WhatsApp Webhook

### Configurar en Meta Business

1. Ir a Meta App Dashboard
2. Configurar Webhook URL: `https://tu-dominio.com/whatsapp/webhook`
3. Token de verificación: Definir en `.env` como `WHATSAPP_WEBHOOK_TOKEN`
4. Suscribirse a eventos de `messages`

### Recibir mensajes de WhatsApp

```http
POST /whatsapp/webhook
Content-Type: application/json

{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "messages": [
              {
                "from": "34123456789",
                "id": "wamid.xxx",
                "timestamp": "1671234567",
                "text": {
                  "body": "Hola, ¿dónde está mi pedido?"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

El módulo automáticamente:
1. Mapea el número de teléfono a un `customerId`
2. Procesa el mensaje con Claude
3. Almacena en la base de datos
4. Envía respuesta de vuelta a WhatsApp

## Integración con Claude AI

El servicio `ClaudeIntegrationService` maneja toda la comunicación con la API de Claude:

### Variables de entorno requeridas
```env
ANTHROPIC_API_KEY=sk-...
```

### Modelo usado
- **Modelo:** claude-3-5-sonnet-20241022
- **Max tokens:** 1024
- **System prompt:** Personalizable por sesión

### Prompt del sistema
El módulo incluye un prompt del sistema predeterminado que configura al asistente para:
- Ser amable y profesional
- Responder en español
- Enfocarse en DomiExpress
- Manejar pedidos, pagos, entregas
- Ofrecer escalación a soporte si es necesario

## Testing

### Ejecutar tests
```bash
npm run test -- chatbot

# Con cobertura
npm run test:cov -- chatbot

# Watch mode
npm run test:watch -- chatbot
```

### Ejemplo de test
```typescript
const chatbotService = module.get<ChatbotService>(ChatbotService);

const response = await chatbotService.processMessage(
  'customer-123',
  '¿Hola, cómo estás?',
  'municipality-456'
);

expect(response.response).toBeDefined();
expect(response.tokens).toBeGreaterThan(0);
```

## Manejo de errores

El módulo maneja los siguientes errores:

| Error | Causa | Solución |
|-------|-------|----------|
| `WsException` | Parámetros inválidos en WebSocket | Verificar datos enviados |
| `ANTHROPIC_API_ERROR` | API de Claude rechaza solicitud | Verificar API key y límites |
| `DATABASE_ERROR` | Error al guardar en BD | Verificar conexión a PostgreSQL |
| `SESSION_NOT_FOUND` | Sesión expirada o no existe | Crear nueva sesión |
| `CUSTOMER_NOT_FOUND` | Cliente no mapeado de WhatsApp | Verificar `mapPhoneToCustomerId` |

## Logs

El módulo genera logs en los siguientes niveles:

```
DEBUG - Información detallada de procesamiento
LOG   - Operaciones normales
WARN  - Advertencias
ERROR - Errores
```

Ejemplo de log:
```
[debug] ChatGateway: Processing message from customer: customer-123, content: ¿Dónde está...
[debug] ClaudeIntegrationService: Claude response processed in 245ms, tokens used: 87
[log] ChatbotService: Message processed for customer customer-123 in 245ms
```

## Performance

### Métricas típicas
- Latencia WebSocket: < 50ms (local)
- Latencia Claude API: 200-500ms
- Almacenamiento mensaje: < 10ms
- Throughput: 100+ sesiones concurrentes

### Optimizaciones
- Caché de sesiones activas en memoria
- Índices en BD para queries rápidas
- Compresión de mensajes en WebSocket
- Pool de conexiones a PostgreSQL

## Próximas características

- [ ] Typing indicators ("está escribiendo...")
- [ ] Reacciones a mensajes (emoji)
- [ ] Carga de archivos/imágenes
- [ ] Análisis de sentimiento
- [ ] Recomendaciones de productos
- [ ] Integración con FAQ base de datos
- [ ] Chat con múltiples agentes
- [ ] Analytics y heatmaps

## Documentación relacionada

- [Claude AI Integration](../../shared/services/claude.service.ts)
- [WebSocket Configuration](./gateways/chat.gateway.ts)
- [Database Schema](../../../prisma/schema.prisma)
- [Main README](../../../README.md)
