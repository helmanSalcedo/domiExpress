import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { MessageIntentDto } from '../dto';

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

@Injectable()
export class ClaudeClient {
  private readonly logger = new Logger(ClaudeClient.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly model = 'claude-3-haiku-20240307';

  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY || '';

    this.client = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    });
  }

  async extractSearchIntent(message: string): Promise<MessageIntentDto> {
    try {
      const prompt = `Analiza este mensaje de un cliente y extrae:
1. Intent: "search" si busca productos, "info" si pide información, "other" para lo demás
2. Entities: Lista de palabras clave o categorías mencionadas
3. Confidence: Confianza (0-1) en tu análisis
4. Query: Si es search, la consulta limpia

Mensaje: "${message}"

Responde en JSON con estructura: {"intent": "...", "entities": [...], "confidence": 0.X, "query": "..."}`;

      const response = await this.client.post<ClaudeResponse>('/messages', {
        model: this.model,
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = response.data.content[0].text;
      const parsed = JSON.parse(responseText);

      this.logger.debug(`Extracted intent from message: ${parsed.intent}`);

      return {
        intent: parsed.intent || 'other',
        entities: parsed.entities || [],
        confidence: parsed.confidence || 0.5,
        query: parsed.query,
      };
    } catch (error) {
      this.logger.error(`Failed to extract intent: ${error}`);
      return {
        intent: 'search',
        entities: [message],
        confidence: 0.3,
        query: message,
      };
    }
  }

  async generateProductDescription(productName: string, category: string): Promise<string> {
    try {
      const prompt = `Genera una descripción breve (máximo 100 palabras) para este producto:
Nombre: ${productName}
Categoría: ${category}

Responde solo con la descripción, sin comillas ni formato adicional.`;

      const response = await this.client.post<ClaudeResponse>('/messages', {
        model: this.model,
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.data.content[0].text;
    } catch (error) {
      this.logger.error(`Failed to generate description: ${error}`);
      return `${productName} en categoría ${category}`;
    }
  }

  async extractProductAttributes(
    message: string,
  ): Promise<{ attributes: string[]; filters: Record<string, string> }> {
    try {
      const prompt = `Extrae atributos de producto del siguiente mensaje:
"${message}"

Responde en JSON con:
- attributes: array de palabras clave (ej: ["picante", "vegetariano"])
- filters: objeto con filtros (ej: {"tipo": "comida", "dieta": "vegetariana"})`;

      const response = await this.client.post<ClaudeResponse>('/messages', {
        model: this.model,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = response.data.content[0].text;
      const parsed = JSON.parse(responseText);

      return {
        attributes: parsed.attributes || [],
        filters: parsed.filters || {},
      };
    } catch (error) {
      this.logger.error(`Failed to extract attributes: ${error}`);
      return {
        attributes: message.split(' '),
        filters: {},
      };
    }
  }
}
