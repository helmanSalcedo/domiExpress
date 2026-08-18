import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatbotController } from './controllers/chatbot.controller';
import { ChatbotService } from './services/chatbot.service';
import { ChatSessionService } from './services/chat-session.service';
import { ChatMessageService } from './services/chat-message.service';
import { ClaudeIntegrationService } from './services/claude-integration.service';
import { IntentAnalyzerService } from './services/intent-analyzer.service';
import { PresetResponsesService } from './services/preset-responses.service';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [
    ChatGateway,
    ChatbotService,
    ChatSessionService,
    ChatMessageService,
    ClaudeIntegrationService,
    IntentAnalyzerService,
    PresetResponsesService,
  ],
  controllers: [ChatbotController],
  exports: [ChatbotService, ChatSessionService, ChatMessageService],
})
export class ChatbotModule {}
