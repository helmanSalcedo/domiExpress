import { Injectable } from '@nestjs/common';

export interface PresetResponse {
  response: string;
  requiresMoreInfo: boolean;
  followUpQuestions?: string[];
}

@Injectable()
export class PresetResponsesService {
  private presetResponses = {
    GREETING: {
      response: '¡Hola! Bienvenido a DomiExpress. Soy tu asistente virtual y estoy aquí para ayudarte. ¿Qué necesitas hoy?',
      requiresMoreInfo: true,
      followUpQuestions: [
        '¿Tienes una consulta sobre un pedido?',
        '¿Necesitas información de nuestros productos?',
        '¿Tienes algún problema con una entrega?',
      ],
    },
    HOURS: {
      response: 'DomiExpress opera 24/7 para tu comodidad. Nuestro equipo de soporte disponible:\n• Atención al cliente: Lunes a Viernes 8 AM - 8 PM\n• Entregas: Todos los días de la semana\n\n¿Hay algo específico en lo que pueda ayudarte?',
      requiresMoreInfo: false,
    },
    MUNICIPALITIES: {
      response: 'Contamos con entregas en múltiples municipios. Los principales incluyen:\n• Bogotá\n• Medellín\n• Cali\n• Bucaramanga\n• Y más...\n\n¿En qué municipio te encuentras?',
      requiresMoreInfo: true,
    },
    PAYMENT_METHODS: {
      response: 'Aceptamos los siguientes métodos de pago:\n• Tarjeta de crédito/débito (Visa, Mastercard, Amex)\n• Transferencia bancaria\n• Pago contra entrega (efectivo)\n• Billetera digital\n\n¿Deseas proceder con alguno de estos métodos?',
      requiresMoreInfo: false,
    },
    DELIVERY_TIME: {
      response: 'Los tiempos de entrega varían según:\n• Tu ubicación (municipio)\n• El tipo de producto\n• La hora de la compra\n\nGeneralmente:\n• Entregas en la ciudad: 2-4 horas\n• Municipios cercanos: 24-48 horas\n• Municipios lejanos: 2-5 días\n\n¿Cuál es tu municipio?',
      requiresMoreInfo: true,
    },
    TRACK_ORDER_HELP: {
      response: 'Para rastrear tu pedido necesito:\n• Número de pedido (encontrarás en tu correo de confirmación)\n• O tu número de teléfono asociado\n\n¿Cuál de estos datos tienes a mano?',
      requiresMoreInfo: true,
      followUpQuestions: ['¿Cuál es tu número de pedido?', '¿Cuál es tu número de teléfono?'],
    },
    NOT_FOUND: {
      response: 'Parece que no encuentro información sobre lo que mencionas. Para ayudarte mejor, ¿podrías ser más específico?\n\nAlgunas opciones que puedo manejar:\n• Rastrear un pedido\n• Información de productos\n• Métodos de pago\n• Horarios de atención\n• Problemas de entrega',
      requiresMoreInfo: true,
    },
    APOLOGIZE_DELAY: {
      response: 'Disculpa por la demora en tu entrega. Tu satisfacción es importante para nosotros.\n\nPara ayudarte, necesito:\n• Tu número de pedido\n• El municipio donde esperabas la entrega\n• Una vez confirmes, contactaré al equipo de entregas para una solución',
      requiresMoreInfo: true,
      followUpQuestions: ['¿Cuál es tu número de pedido?', '¿En qué municipio esperabas la entrega?'],
    },
    DEFECTIVE_ITEM: {
      response: 'Lamentamos que el producto haya llegado en mal estado. Estamos aquí para resolverlo.\n\nPara proceder:\n1. Cuéntame qué problema tiene el artículo\n2. Confirma tu número de pedido\n3. Si es posible, comparte una foto del producto\n\nOfrecemos reemplazo o reembolso total.',
      requiresMoreInfo: true,
      followUpQuestions: ['¿Cuál es tu número de pedido?', '¿Qué específicamente está dañado o defectuoso?'],
    },
    RETURN_PROCESS: {
      response: 'Nuestro proceso de devolución es simple:\n\n1. Solicita la devolución dentro de 30 días\n2. Empacamos el producto en condiciones originales\n3. Coordinamos la recolección\n4. Procesamos el reembolso en 5-7 días hábiles\n\n¿Deseas iniciar una devolución? Necesitaré tu número de pedido.',
      requiresMoreInfo: true,
    },
  };

  getPresetResponse(key: string): PresetResponse | null {
    return this.presetResponses[key as keyof typeof this.presetResponses] || null;
  }

  detectPresetResponse(userMessage: string): PresetResponse | null {
    const messageLower = userMessage.toLowerCase();

    if (
      messageLower.includes('hola') ||
      messageLower.includes('buenos días') ||
      messageLower.includes('buenas noches') ||
      messageLower.includes('buenas tardes')
    ) {
      return this.presetResponses.GREETING;
    }

    if (messageLower.includes('horario') || messageLower.includes('hora') || messageLower.includes('abierto')) {
      return this.presetResponses.HOURS;
    }

    if (messageLower.includes('municipio') || messageLower.includes('ciudades') || messageLower.includes('cobertura')) {
      return this.presetResponses.MUNICIPALITIES;
    }

    if (messageLower.includes('pago') || messageLower.includes('metodos') || messageLower.includes('tarjeta')) {
      return this.presetResponses.PAYMENT_METHODS;
    }

    if (messageLower.includes('cuanto tarda') || messageLower.includes('tiempo entrega') || messageLower.includes('demora')) {
      return this.presetResponses.DELIVERY_TIME;
    }

    if (messageLower.includes('rastrear') || messageLower.includes('seguimiento') || messageLower.includes('dónde está')) {
      return this.presetResponses.TRACK_ORDER_HELP;
    }

    if ((messageLower.includes('demora') || messageLower.includes('retraso')) && messageLower.includes('entrega')) {
      return this.presetResponses.APOLOGIZE_DELAY;
    }

    if (messageLower.includes('dañado') || messageLower.includes('roto') || messageLower.includes('defecto')) {
      return this.presetResponses.DEFECTIVE_ITEM;
    }

    if (messageLower.includes('devolver') || messageLower.includes('devolución') || messageLower.includes('cambio')) {
      return this.presetResponses.RETURN_PROCESS;
    }

    return null;
  }

  shouldUsePresetResponse(confidence: number, intent: string): boolean {
    const commonIntents = ['GREETING', 'HOURS', 'PAYMENT_METHODS'];
    return confidence > 0.7 || commonIntents.includes(intent);
  }
}
