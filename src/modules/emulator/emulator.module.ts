import { Module } from '@nestjs/common';
import { EmulatorController } from './emulator.controller';
import { EmulatorPageController } from './emulator-page.controller';
import { EmulatorService } from './emulator.service';
import { WhatsAppConversationService } from './whatsapp-conversation.service';
import { ChatGPTService } from './chatgpt.service';

@Module({
  controllers: [EmulatorController, EmulatorPageController],
  providers: [EmulatorService, WhatsAppConversationService, ChatGPTService],
})
export class EmulatorModule {}
