import { Test, TestingModule } from '@nestjs/testing';
import { ChatbotService } from './chatbot.service';
import { ChatSessionService } from './chat-session.service';
import { ChatMessageService } from './chat-message.service';
import { ClaudeIntegrationService } from './claude-integration.service';

describe('ChatbotService', () => {
  let service: ChatbotService;
  let sessionService: ChatSessionService;
  let messageService: ChatMessageService;
  let claudeService: ClaudeIntegrationService;

  const mockSessionService = {
    createSession: jest.fn(),
    getActiveSession: jest.fn(),
    updateMessageCount: jest.fn(),
  };

  const mockMessageService = {
    createMessage: jest.fn(),
    getRecentMessages: jest.fn(),
  };

  const mockClaudeService = {
    processMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        {
          provide: ChatSessionService,
          useValue: mockSessionService,
        },
        {
          provide: ChatMessageService,
          useValue: mockMessageService,
        },
        {
          provide: ClaudeIntegrationService,
          useValue: mockClaudeService,
        },
      ],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);
    sessionService = module.get<ChatSessionService>(ChatSessionService);
    messageService = module.get<ChatMessageService>(ChatMessageService);
    claudeService = module.get<ClaudeIntegrationService>(ClaudeIntegrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processMessage', () => {
    it('should process a message and return response', async () => {
      const customerId = 'test-customer-123';
      const message = 'Hola, ¿cómo estás?';
      const municipalityId = 'test-municipality';

      const mockSession = {
        id: 'session-123',
        customerId,
        municipalityId,
        status: 'ACTIVE',
      };

      const mockMessages = [
        {
          role: 'user',
          content: message,
        },
      ];

      const mockClaudeResponse = {
        response: 'Hola! Estoy aquí para ayudarte con DomiExpress.',
        tokens: 50,
        processingTimeMs: 200,
      };

      mockSessionService.getActiveSession.mockResolvedValue(mockSession);
      mockMessageService.getRecentMessages.mockResolvedValue(mockMessages);
      mockClaudeService.processMessage.mockResolvedValue(mockClaudeResponse);
      mockMessageService.createMessage
        .mockResolvedValueOnce({ id: 'msg-1', role: 'USER' })
        .mockResolvedValueOnce({
          id: 'msg-2',
          role: 'ASSISTANT',
          content: mockClaudeResponse.response,
        });

      const result = await service.processMessage(customerId, message, municipalityId);

      expect(result).toBeDefined();
      expect(result.response).toBe(mockClaudeResponse.response);
      expect(mockSessionService.getActiveSession).toHaveBeenCalledWith(customerId);
      expect(mockClaudeService.processMessage).toHaveBeenCalled();
    });

    it('should create new session if none exists', async () => {
      const customerId = 'new-customer';
      const message = 'Hola';

      const newSession = {
        id: 'new-session-123',
        customerId,
        municipalityId: 'default',
      };

      mockSessionService.getActiveSession.mockResolvedValue(null);
      mockSessionService.createSession.mockResolvedValue(newSession);
      mockMessageService.getRecentMessages.mockResolvedValue([]);
      mockClaudeService.processMessage.mockResolvedValue({
        response: 'Bienvenido a DomiExpress',
        tokens: 30,
        processingTimeMs: 150,
      });
      mockMessageService.createMessage
        .mockResolvedValueOnce({ id: 'msg-1', role: 'USER' })
        .mockResolvedValueOnce({ id: 'msg-2', role: 'ASSISTANT' });

      const result = await service.processMessage(customerId, message, 'default');

      expect(result).toBeDefined();
      expect(mockSessionService.createSession).toHaveBeenCalledWith({
        customerId,
        municipalityId: 'default',
      });
    });
  });

  describe('createSession', () => {
    it('should create a new chat session', async () => {
      const customerId = 'customer-123';
      const municipalityId = 'municipality-456';

      const mockSession = {
        id: 'session-789',
        customerId,
        municipalityId,
        status: 'ACTIVE',
      };

      mockSessionService.createSession.mockResolvedValue(mockSession);

      const result = await service.createSession(customerId, municipalityId);

      expect(result).toEqual(mockSession);
      expect(mockSessionService.createSession).toHaveBeenCalledWith({
        customerId,
        municipalityId,
      });
    });
  });
});
