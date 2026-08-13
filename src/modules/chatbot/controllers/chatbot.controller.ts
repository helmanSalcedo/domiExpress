import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatbotService } from '../services/chatbot.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { ChatSessionDto, ChatResponseDto } from '../dto/chat-session.dto';

@ApiTags('Chatbot')
@Controller('chat')
export class ChatbotController {
  private readonly logger = new Logger(ChatbotController.name);

  constructor(private chatbotService: ChatbotService) {}

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({
    status: 201,
    description: 'Chat session created successfully',
    type: ChatSessionDto,
  })
  async createSession(
    @Body()
    body: {
      customerId: string;
      municipalityId: string;
    },
  ): Promise<ChatSessionDto> {
    this.logger.log(
      `Creating new chat session for customer: ${body.customerId}`,
    );
    return this.chatbotService.createSession(
      body.customerId,
      body.municipalityId,
    );
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get chat session details' })
  @ApiResponse({
    status: 200,
    description: 'Chat session retrieved successfully',
    type: ChatSessionDto,
  })
  async getSession(@Param('sessionId') sessionId: string): Promise<ChatSessionDto | null> {
    this.logger.log(`Fetching session: ${sessionId}`);
    return this.chatbotService.getSession(sessionId);
  }

  @Post('messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message to the chatbot' })
  @ApiResponse({
    status: 200,
    description: 'Message processed successfully',
    type: ChatResponseDto,
  })
  async sendMessage(@Body() dto: CreateMessageDto): Promise<ChatResponseDto> {
    this.logger.log(`Processing message from customer: ${dto.customerId}`);
    return this.chatbotService.processMessage(
      dto.customerId,
      dto.content,
    );
  }

  @Get('sessions/:sessionId/history')
  @ApiOperation({ summary: 'Get chat history for a session' })
  @ApiResponse({
    status: 200,
    description: 'Chat history retrieved successfully',
  })
  async getHistory(
    @Param('sessionId') sessionId: string,
  ) {
    this.logger.log(`Fetching history for session: ${sessionId}`);
    return this.chatbotService.getConversationHistory(sessionId);
  }

  @Put('sessions/:sessionId/close')
  @ApiOperation({ summary: 'Close a chat session' })
  @ApiResponse({
    status: 200,
    description: 'Chat session closed successfully',
  })
  async closeSession(@Param('sessionId') sessionId: string): Promise<ChatSessionDto> {
    this.logger.log(`Closing session: ${sessionId}`);
    return this.chatbotService.closeSession(sessionId);
  }

  @Get('health')
  @ApiOperation({ summary: 'Chatbot health check' })
  @ApiResponse({
    status: 200,
    description: 'Chatbot is running',
  })
  health() {
    return {
      status: 'ok',
      timestamp: new Date(),
      service: 'chatbot',
    };
  }
}
