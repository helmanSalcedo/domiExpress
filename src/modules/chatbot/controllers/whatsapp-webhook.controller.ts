import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatbotService } from '../services/chatbot.service';
import { WhatsAppWebhookDto } from '../dto/whatsapp-webhook.dto';

@ApiTags('WhatsApp Webhook')
@Controller('whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);
  private readonly webhookToken = process.env.WHATSAPP_WEBHOOK_TOKEN || 'test_token';

  constructor(private chatbotService: ChatbotService) {}

  @Get('webhook')
  @ApiOperation({ summary: 'WhatsApp webhook verification' })
  webhookVerification(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
  ) {
    if (mode === 'subscribe' && token === this.webhookToken) {
      this.logger.log('Webhook verified');
      return challenge;
    }

    this.logger.error('Webhook verification failed');
    return 'Forbidden';
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive WhatsApp messages' })
  async handleWebhook(@Body() payload: WhatsAppWebhookDto) {
    try {
      if (!payload.entry || payload.entry.length === 0) {
        return { success: true };
      }

      for (const entry of payload.entry) {
        if (!entry.changes || entry.changes.length === 0) {
          continue;
        }

        for (const change of entry.changes) {
          if (!change.value.messages) {
            continue;
          }

          for (const message of change.value.messages) {
            this.logger.log(
              `Received WhatsApp message from: ${message.from}, text: ${message.text}`,
            );

            // Mapear número de WhatsApp a customerId
            // En producción, esto sería una búsqueda en la BD
            const customerId = await this.mapPhoneToCustomerId(message.from);

            if (customerId) {
              await this.chatbotService.processMessage(
                customerId,
                message.text,
              );
            }
          }
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async mapPhoneToCustomerId(phone: string): Promise<string | null> {
    // TODO: Implementar búsqueda de customer por teléfono
    // Por ahora retornar null
    this.logger.debug(`Mapping phone ${phone} to customer`);
    return null;
  }
}
