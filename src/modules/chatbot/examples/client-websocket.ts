/**
 * Ejemplo: Cliente WebSocket para Chatbot
 *
 * Este archivo muestra cómo conectarse y usar el chatbot desde un cliente
 * (React, Vue, Angular, etc.)
 *
 * Requisitos:
 * npm install socket.io-client
 */

import { io, Socket } from 'socket.io-client';

class ChatbotClient {
  private socket: Socket;
  private sessionId: string | null = null;
  private customerId: string;
  private municipalityId: string;

  constructor(
    customerId: string,
    municipalityId: string,
    serverUrl: string = 'http://localhost:3000',
  ) {
    this.customerId = customerId;
    this.municipalityId = municipalityId;

    // Configurar conexión WebSocket
    this.socket = io(`${serverUrl}/chat`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Evento cuando se conecta
    this.socket.on('connect', () => {
      console.log('✅ Conectado al chatbot');
      this.startSession();
    });

    // Evento cuando se desconecta
    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del chatbot');
      this.sessionId = null;
    });

    // Evento de conexión exitosa del servidor
    this.socket.on('connected', data => {
      console.log('📍 Socket ID:', data.socketId);
    });

    // Respuesta del chatbot
    this.socket.on('message_response', data => {
      if (data.status === 'success') {
        console.log('\n🤖 Bot:', data.data.response);
        console.log(`⏱️  Tiempo: ${data.data.processingTimeMs}ms`);
        console.log(`📊 Tokens: ${data.data.tokens}`);
      }
    });

    // Mensajes de otros clientes en la misma sesión
    this.socket.on('message_received', data => {
      console.log('\n👥 Otro cliente:', data.response);
    });

    // Errores
    this.socket.on('error', data => {
      console.error('⚠️  Error:', data.message);
    });

    // Pong del ping
    this.socket.on('message', data => {
      if (data.status === 'pong') {
        console.log('✓ Conexión activa');
      }
    });
  }

  private startSession(): void {
    this.socket.emit('start_session', {
      customerId: this.customerId,
      municipalityId: this.municipalityId,
    });
  }

  public sendMessage(content: string): void {
    if (!this.sessionId) {
      console.error('❌ Sesión no iniciada');
      return;
    }

    console.log('\n👤 Tú:', content);

    this.socket.emit('send_message', {
      customerId: this.customerId,
      content,
      source: 'WEBSOCKET',
      messageType: 'TEXT',
    });
  }

  public getHistory(limit: number = 50): void {
    if (!this.sessionId) {
      console.error('❌ Sesión no iniciada');
      return;
    }

    this.socket.emit('get_history', {
      sessionId: this.sessionId,
      limit,
    });
  }

  public closeSession(): void {
    if (!this.sessionId) {
      console.error('❌ Sesión no iniciada');
      return;
    }

    this.socket.emit('end_session', {
      sessionId: this.sessionId,
    });

    this.sessionId = null;
  }

  public ping(): void {
    this.socket.emit('ping');
  }

  public disconnect(): void {
    if (this.sessionId) {
      this.closeSession();
    }
    this.socket.disconnect();
  }

  public getSessionId(): string | null {
    return this.sessionId;
  }

  public isConnected(): boolean {
    return this.socket.connected;
  }
}

// ============================================================================
// EJEMPLO DE USO
// ============================================================================

/*
const chatbot = new ChatbotClient(
  'customer-123',
  'municipality-456',
  'http://localhost:3000'
);

// Esperar a que se conecte y abra sesión
setTimeout(() => {
  chatbot.sendMessage('Hola, ¿cómo estás?');
  chatbot.sendMessage('¿Cuál es el estado de mi pedido?');
  chatbot.sendMessage('¿Cuál es el costo de envío?');
}, 2000);

// Obtener historial después de 10 segundos
setTimeout(() => {
  chatbot.getHistory(10);
}, 10000);

// Cerrar sesión después de 15 segundos
setTimeout(() => {
  chatbot.closeSession();
  chatbot.disconnect();
}, 15000);
*/

export { ChatbotClient };
