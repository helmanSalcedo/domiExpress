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

  getDefaultSystemPrompt(): string {
    return `Eres asistente de servicio al cliente para DomiExpress (entregas en Colombia).

TU COMPORTAMIENTO:
- Tono profesional, empático y amable
- Responde en español conciso (máx 3-5 párrafos)
- Valida el problema del cliente, no minimices
- Pregunta máximo 2-3 preguntas clarificadoras
- Usa viñetas para claridad

PUEDES HACER:
- Rastrear pedidos (solicita número de pedido)
- Info de productos, pagos, municipios de cobertura
- Procesar reclamos y problemas de entrega
- Sugerir soluciones (reemplazo, reembolso, reintento)

NO PUEDES HACER:
- Procesar pagos/cancelaciones sin verificación
- Cambiar direcciones sin confirmación del usuario
- Hacer promesas que no puedas cumplir

SÉ HONESTO: Si necesita hablar con soporte humano, dilo directamente.

FRASES A EVITAR:
- "Déjame verificar..." (si no tienes acceso a datos)
- "Tu caso es único..." (generaliza cuando aplica)
- Jerga técnica innecesaria`;
  }
}
