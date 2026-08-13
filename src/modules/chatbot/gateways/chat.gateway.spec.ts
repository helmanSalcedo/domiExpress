import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatbotService } from '../services/chatbot.service';
import { WsException } from '@nestjs/websockets';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatbotService: ChatbotService;

  const mockChatbotService = {
    createSession: jest.fn(),
    processMessage: jest.fn(),
    getConversationHistory: jest.fn(),
    closeSession: jest.fn(),
    getSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatbotService,
          useValue: mockChatbotService,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatbotService = module.get<ChatbotService>(ChatbotService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleStartSession', () => {
    it('should start a new chat session', async () => {
      const mockClient = {
        id: 'socket-123',
        emit: jest.fn(),
        join: jest.fn(),
      };

      const sessionData = {
        customerId: 'customer-123',
        municipalityId: 'municipality-456',
      };

      const mockSession = {
        id: 'session-789',
        customerId: sessionData.customerId,
        municipalityId: sessionData.municipalityId,
        status: 'ACTIVE',
      };

      mockChatbotService.createSession.mockResolvedValue(mockSession);

      const result = await gateway.handleStartSession(mockClient as any, sessionData);

      expect(result.status).toBe('success');
      expect(result.sessionId).toBe(mockSession.id);
      expect(mockChatbotService.createSession).toHaveBeenCalledWith(
        sessionData.customerId,
        sessionData.municipalityId,
      );
      expect(mockClient.join).toHaveBeenCalledWith(`chat-${mockSession.id}`);
    });

    it('should throw error if customerId is missing', async () => {
      const mockClient = {
        id: 'socket-123',
        emit: jest.fn(),
      };

      const sessionData = {
        customerId: '',
        municipalityId: 'municipality-456',
      };

      await expect(gateway.handleStartSession(mockClient as any, sessionData)).rejects.toThrow(
        WsException,
      );
    });
  });

  describe('handleSendMessage', () => {
    it('should process a message', async () => {
      const mockClient = {
        id: 'socket-123',
        emit: jest.fn(),
        to: jest.fn().mockReturnThis(),
      };

      const messageData = {
        customerId: 'customer-123',
        content: 'Hola chatbot',
        source: 'WEBSOCKET',
      };

      const mockResponse = {
        sessionId: 'session-123',
        messageId: 'msg-123',
        response: 'Hola! ¿En qué puedo ayudarte?',
        tokens: 50,
        processingTimeMs: 200,
      };

      gateway['connectedClients'].set(mockClient.id, {
        customerId: messageData.customerId,
        sessionId: 'session-123',
      });

      mockChatbotService.processMessage.mockResolvedValue(mockResponse);

      const result = await gateway.handleSendMessage(mockClient as any, messageData);

      expect(result.status).toBe('success');
      expect(mockClient.emit).toHaveBeenCalledWith('message_response', expect.any(Object));
    });
  });

  describe('handlePing', () => {
    it('should return pong', () => {
      const mockClient = { id: 'socket-123' };

      const result = gateway.handlePing(mockClient as any);

      expect(result.status).toBe('pong');
      expect(result.timestamp).toBeDefined();
    });
  });
});
