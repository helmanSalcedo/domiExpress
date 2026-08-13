/**
 * Ejemplo: Cliente REST para Chatbot
 *
 * Si prefieres usar REST en lugar de WebSocket, puedes usar estos endpoints
 */

import axios, { AxiosInstance } from 'axios';

interface ChatSession {
  id: string;
  customerId: string;
  municipalityId: string;
  status: string;
  messageCount: number;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatResponse {
  sessionId: string;
  messageId: string;
  response: string;
  tokens?: number;
  processingTimeMs?: number;
  timestamp: Date;
}

class ChatbotRestClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Crear nueva sesión
  async createSession(
    customerId: string,
    municipalityId: string,
  ): Promise<ChatSession> {
    const response = await this.client.post('/chat/sessions', {
      customerId,
      municipalityId,
    });
    return response.data;
  }

  // Obtener sesión existente
  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await this.client.get(`/chat/sessions/${sessionId}`);
    return response.data;
  }

  // Enviar mensaje
  async sendMessage(
    customerId: string,
    content: string,
  ): Promise<ChatResponse> {
    const response = await this.client.post('/chat/messages', {
      customerId,
      content,
      source: 'API',
      messageType: 'TEXT',
    });
    return response.data;
  }

  // Obtener historial de conversación
  async getHistory(sessionId: string, limit: number = 50) {
    const response = await this.client.get(
      `/chat/sessions/${sessionId}/history?limit=${limit}`,
    );
    return response.data;
  }

  // Cerrar sesión
  async closeSession(sessionId: string): Promise<ChatSession> {
    const response = await this.client.put(`/chat/sessions/${sessionId}/close`);
    return response.data;
  }

  // Health check
  async health() {
    const response = await this.client.get('/chat/health');
    return response.data;
  }
}

// ============================================================================
// EJEMPLO DE USO
// ============================================================================

/*
const chatbot = new ChatbotRestClient('http://localhost:3000');

async function demonstrateChat() {
  try {
    // 1. Verificar que el servicio está activo
    console.log('Checking chatbot health...');
    const health = await chatbot.health();
    console.log('✅ Chatbot is running:', health.status);

    // 2. Crear una nueva sesión
    console.log('\nCreating chat session...');
    const session = await chatbot.createSession(
      'customer-123',
      'municipality-456',
    );
    console.log('✅ Session created:', session.id);

    // 3. Enviar mensajes
    console.log('\nSending messages...');

    const msg1 = await chatbot.sendMessage(
      'customer-123',
      'Hola, ¿cómo estás?',
    );
    console.log('🤖 Bot:', msg1.response);
    console.log(`⏱️  ${msg1.processingTimeMs}ms | 📊 ${msg1.tokens} tokens`);

    const msg2 = await chatbot.sendMessage(
      'customer-123',
      '¿Cuál es el estado de mi pedido?',
    );
    console.log('🤖 Bot:', msg2.response);
    console.log(`⏱️  ${msg2.processingTimeMs}ms | 📊 ${msg2.tokens} tokens`);

    // 4. Obtener historial
    console.log('\nFetching conversation history...');
    const history = await chatbot.getHistory(session.id, 50);
    console.log('✅ Messages:', history.messages.length);

    // 5. Cerrar sesión
    console.log('\nClosing session...');
    const closedSession = await chatbot.closeSession(session.id);
    console.log('✅ Session closed at:', closedSession.closedAt);

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

demonstrateChat();
*/

export { ChatbotRestClient };
export type { ChatSession, ChatResponse };
