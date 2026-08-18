import { Injectable, Logger } from '@nestjs/common';

export interface IntentAnalysis {
  intent: 'TRACK_ORDER' | 'PRODUCT_INFO' | 'PAYMENT' | 'COMPLAINT' | 'DELIVERY_ISSUE' | 'RETURN' | 'GENERAL';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  keywords: string[];
  confidence: number;
  suggestedAction: string;
}

@Injectable()
export class IntentAnalyzerService {
  private readonly logger = new Logger(IntentAnalyzerService.name);

  private intentPatterns = {
    TRACK_ORDER: {
      keywords: ['dónde', 'estado', 'pedido', 'orden', 'seguimiento', 'ubicación', 'llegará', 'entrega', 'rastrear', 'track'],
      priority: 'MEDIUM',
    },
    PRODUCT_INFO: {
      keywords: ['producto', 'precio', 'especificaciones', 'características', 'disponibilidad', 'marca', 'talla', 'color', 'detalles', 'información'],
      priority: 'LOW',
    },
    PAYMENT: {
      keywords: ['pago', 'cobro', 'tarjeta', 'dinero', 'costo', 'valor', 'factura', 'recibo', 'transacción', 'pagar', 'efectivo'],
      priority: 'HIGH',
    },
    COMPLAINT: {
      keywords: ['reclamo', 'queja', 'problema', 'defecto', 'dañado', 'roto', 'incorrecto', 'mal', 'no funciona', 'error', 'insatisfecho', 'decepcio'],
      priority: 'HIGH',
    },
    DELIVERY_ISSUE: {
      keywords: ['entrega', 'no llegó', 'perdido', 'retraso', 'demora', 'atrasado', 'retrasada', 'dirección', 'ubicación incorrecta', 'no entregó', 'falta'],
      priority: 'HIGH',
    },
    RETURN: {
      keywords: ['devolver', 'devolución', 'cambio', 'reemplazo', 'no quiero', 'me arrepentí', 'retorno', 'devuelvo'],
      priority: 'MEDIUM',
    },
  };

  analyzeIntent(userMessage: string): IntentAnalysis {
    const messageLower = userMessage.toLowerCase();

    const matches: Record<string, number> = {};

    for (const [intent, config] of Object.entries(this.intentPatterns)) {
      let score = 0;
      const foundKeywords: string[] = [];

      for (const keyword of config.keywords) {
        if (messageLower.includes(keyword)) {
          score += 1;
          foundKeywords.push(keyword);
        }
      }

      if (score > 0) {
        matches[intent] = score;
      }
    }

    let detectedIntent = 'GENERAL';
    let maxScore = 0;

    for (const [intent, score] of Object.entries(matches)) {
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }

    const intentConfig = this.intentPatterns[detectedIntent as keyof typeof this.intentPatterns] || { priority: 'LOW' };
    const foundKeywords = this.extractKeywords(messageLower, detectedIntent);
    const confidence = Math.min(100, (maxScore / 3) * 100);

    this.logger.debug(`Intent detected: ${detectedIntent} (confidence: ${confidence}%)`);

    return {
      intent: detectedIntent as any,
      priority: intentConfig.priority as any,
      keywords: foundKeywords,
      confidence,
      suggestedAction: this.getSuggestedAction(detectedIntent),
    };
  }

  private extractKeywords(message: string, intent: string): string[] {
    const keywords: string[] = [];
    const patterns = this.intentPatterns[intent as keyof typeof this.intentPatterns];

    if (patterns) {
      for (const keyword of patterns.keywords) {
        if (message.includes(keyword)) {
          keywords.push(keyword);
        }
      }
    }

    return keywords.slice(0, 3);
  }

  private getSuggestedAction(intent: string): string {
    const actions: Record<string, string> = {
      TRACK_ORDER: 'Solicitar número de pedido para rastreo',
      PRODUCT_INFO: 'Proporcionar detalles del producto',
      PAYMENT: 'Ofrecer asistencia con métodos de pago o verificar transacción',
      COMPLAINT: 'Escuchar problema, empatizar y ofrecer solución o escalada',
      DELIVERY_ISSUE: 'Investigar estado de entrega y ofrecer alternativas',
      RETURN: 'Explicar proceso de devolución y solicitar razón',
      GENERAL: 'Ofrecer ayuda general con preguntas clarificadoras',
    };

    return actions[intent] || actions.GENERAL;
  }
}
