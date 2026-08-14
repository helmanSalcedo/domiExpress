export class ChatSessionDto {
  id!: string;
  customerId!: string;
  municipalityId!: string;
  socketId?: string;
  status!: string;
  messageCount!: number;
  context?: any;
  lastMessageAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
  closedAt?: Date;
}

export class CreateChatSessionDto {
  customerId!: string;
  municipalityId!: string;
  socketId?: string;
}

export class ChatMessageDto {
  id!: string;
  chatSessionId!: string;
  role!: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content!: string;
  source!: string;
  messageType!: string;
  metadata?: any;
  tokens?: number;
  processingTimeMs?: number;
  createdAt!: Date;
}

export class ChatResponseDto {
  sessionId!: string;
  messageId!: string;
  response!: string;
  role!: 'ASSISTANT';
  tokens?: number;
  processingTimeMs?: number;
  timestamp!: Date;
}
