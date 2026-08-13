import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: any;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

@Injectable()
export class ClaudeIntegrationService {
  private readonly logger = new Logger(ClaudeIntegrationService.name);
  private readonly apiKey = process.env.ANTHROPIC_API_KEY;
  private readonly baseUrl = 'https://api.anthropic.com/v1';
  private readonly model = 'claude-3-5-sonnet-20241022';

  async processMessage(
    messages: ClaudeMessage[],
    systemPrompt?: string,
  ): Promise<{ response: string; tokens: number; processingTimeMs: number }> {
    const startTime = Date.now();

    try {
      const response = await axios.post<ClaudeResponse>(
        `${this.baseUrl}/messages`,
        {
          model: this.model,
          max_tokens: 1024,
          system: systemPrompt || this.getDefaultSystemPrompt(),
          messages: messages,
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        },
      );

      const processingTimeMs = Date.now() - startTime;
      const text = response.data.content[0].text;
      const tokens = response.data.usage.output_tokens;

      this.logger.debug(
        `Claude response processed in ${processingTimeMs}ms, tokens used: ${tokens}`,
      );

      return {
        response: text,
        tokens,
        processingTimeMs,
      };
    } catch (error) {
      this.logger.error('Error calling Claude API', error);
      throw error;
    }
  }

  private getDefaultSystemPrompt(): string {
    return `Eres un asistente de servicio al cliente amable y profesional para DomiExpress,
una plataforma de entregas multi-municipio en Colombia.

Tu rol es:
- Ayudar a los clientes con sus pedidos
- Responder preguntas sobre productos
- Asistir con problemas de entregas
- Proporcionar información sobre pagos
- Ser empático y resolver problemas rápidamente

Siempre responde en español, de manera clara y concisa.
Mantén un tono profesional pero amable.
Si no puedes resolver algo, ofrece contactar al equipo de soporte.`;
  }
}
