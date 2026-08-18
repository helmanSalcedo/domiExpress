import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmulatorService } from './emulator.service';

@ApiTags('Emulator')
@Controller('emulator')
export class EmulatorController {
  constructor(private readonly emulatorService: EmulatorService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send message to chatbot emulator (WhatsApp API simulation)' })
  async sendMessage(
    @Body() dto: { channel: string; message: string; phone: string },
  ) {
    return this.emulatorService.processMessage(dto);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages by channel' })
  async getMessages(@Query('channel') channel: string): Promise<any> {
    return this.emulatorService.getMessagesByChannel(channel);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get message statistics' })
  async getStats() {
    return this.emulatorService.getStats();
  }

  @Post('clear')
  @ApiOperation({ summary: 'Clear all emulator messages (dev only)' })
  async clearMessages() {
    return this.emulatorService.clearAll();
  }
}
