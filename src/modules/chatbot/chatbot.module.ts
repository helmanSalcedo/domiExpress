import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatbotController } from './controllers/chatbot.controller';
import { WhatsAppWebhookController } from './controllers/whatsapp-webhook.controller';
import { ChatbotService } from './services/chatbot.service';
import { ChatSessionService } from './services/chat-session.service';
import { ChatMessageService } from './services/chat-message.service';
import { ClaudeIntegrationService } from './services/claude-integration.service';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [
    ChatGateway,
    ChatbotService,
    ChatSessionService,
    ChatMessageService,
    ClaudeIntegrationService,
  ],
  controllers: [ChatbotController, WhatsAppWebhookController],
  exports: [ChatbotService, ChatSessionService, ChatMessageService],
})
export class ChatbotModule {}
