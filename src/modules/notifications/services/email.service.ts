import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly client: AxiosInstance;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor() {
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@domiexpress.co';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'DomiExpress';

    this.client = axios.create({
      baseURL: 'https://api.sendgrid.com/v3',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async sendEmail(
    to: string,
    template: EmailTemplate,
    variables?: Record<string, string>,
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        this.logger.warn('⚠️ SendGrid API key not configured, skipping email');
        return { success: true };
      }

      let html = template.html;
      let text = template.text || '';
      let subject = template.subject;

      // Replace variables
      if (variables) {
        Object.entries(variables).forEach(([key, value]) => {
          const placeholder = `{{${key}}}`;
          html = html.replace(new RegExp(placeholder, 'g'), value);
          text = text.replace(new RegExp(placeholder, 'g'), value);
          subject = subject.replace(new RegExp(placeholder, 'g'), value);
        });
      }

      this.logger.log(`📧 Sending email to ${to}: ${subject}`);

      await this.client.post('/mail/send', {
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        content: [
          {
            type: 'text/html',
            value: html,
          },
          {
            type: 'text/plain',
            value: text,
          },
        ],
      });

      this.logger.log(`✅ Email sent successfully to ${to}`);
      return { success: true, messageId: `sendgrid-${Date.now()}` };
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email: ${error instanceof Error ? error.message : error}`,
      );
      return { success: false };
    }
  }

  async sendOrderConfirmation(email: string, orderId: string, amount: number): Promise<boolean> {
    const template: EmailTemplate = {
      subject: '¡Tu pedido fue confirmado! 🎉 - DomiExpress',
      html: `
        <h1>¡Pedido Confirmado!</h1>
        <p>Hola,</p>
        <p>Tu pedido <strong>#{{orderId}}</strong> ha sido confirmado.</p>
        <p><strong>Monto total:</strong> ${{ amount }}</p>
        <p>Tu pedido será entregado en los próximos 30-45 minutos.</p>
        <p>Puedes seguir tu pedido en tiempo real en la app.</p>
        <hr>
        <p>DomiExpress 🚚</p>
      `,
      text: `Pedido confirmado: #{{orderId}}\nMonto: ${{ amount }}\n\nSigue tu pedido en la app.`,
    };

    const result = await this.sendEmail(email, template, {
      orderId,
      amount: amount.toLocaleString('es-CO'),
    });

    return result.success;
  }

  async sendDeliveryNotification(
    email: string,
    orderId: string,
    driverName: string,
    phone: string,
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: '¡Tu pedido está en camino! 🚗 - DomiExpress',
      html: `
        <h1>¡Tu Pedido Está en Camino!</h1>
        <p>Hola,</p>
        <p>Tu pedido <strong>#{{orderId}}</strong> ha sido asignado a nuestro conductor:</p>
        <p>
          <strong>Conductor:</strong> {{driverName}}<br>
          <strong>Teléfono:</strong> {{phone}}
        </p>
        <p>Puedes seguir tu pedido en tiempo real en la app para ver la ubicación del conductor.</p>
        <p>Tiempo estimado de llegada: 15-20 minutos</p>
        <hr>
        <p>DomiExpress 🚚</p>
      `,
      text: `Pedido en camino: #{{orderId}}\nConductor: {{driverName}}\nTeléfono: {{phone}}\n\nSigue en tiempo real en la app.`,
    };

    const result = await this.sendEmail(email, template, {
      orderId,
      driverName,
      phone,
    });

    return result.success;
  }

  async sendDeliveryCompleted(email: string, orderId: string, amount: number): Promise<boolean> {
    const template: EmailTemplate = {
      subject: '¡Tu pedido fue entregado! ✅ - DomiExpress',
      html: `
        <h1>¡Pedido Entregado!</h1>
        <p>Hola,</p>
        <p>Tu pedido <strong>#{{orderId}}</strong> ha sido entregado exitosamente.</p>
        <p><strong>Monto pagado:</strong> ${{ amount }}</p>
        <p>¿Te gustaría calificar tu experiencia? Entra a la app y déjanos tu reseña.</p>
        <p>¡Gracias por usar DomiExpress! 🙏</p>
        <hr>
        <p>DomiExpress 🚚</p>
      `,
      text: `Pedido entregado: #{{orderId}}\nMonto: ${{ amount }}\n\nCalifica tu experiencia en la app.`,
    };

    const result = await this.sendEmail(email, template, {
      orderId,
      amount: amount.toLocaleString('es-CO'),
    });

    return result.success;
  }

  async sendPaymentReceipt(
    email: string,
    orderId: string,
    amount: number,
    paymentMethod: string,
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Recibo de Pago - DomiExpress',
      html: `
        <h1>Recibo de Pago</h1>
        <p>Hola,</p>
        <p>Aquí está el recibo de tu pago:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>Pedido ID:</strong></td>
            <td style="border: 1px solid #ddd; padding: 10px;">{{orderId}}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>Monto:</strong></td>
            <td style="border: 1px solid #ddd; padding: 10px;">${{ amount }}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>Método de Pago:</strong></td>
            <td style="border: 1px solid #ddd; padding: 10px;">{{paymentMethod}}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>Estado:</strong></td>
            <td style="border: 1px solid #ddd; padding: 10px;">✅ Aprobado</td>
          </tr>
        </table>
        <hr>
        <p>DomiExpress 🚚</p>
      `,
      text: `Recibo de Pago\nPedido: {{orderId}}\nMonto: ${{ amount }}\nMétodo: {{paymentMethod}}\nEstado: Aprobado`,
    };

    const result = await this.sendEmail(email, template, {
      orderId,
      amount: amount.toLocaleString('es-CO'),
      paymentMethod,
    });

    return result.success;
  }

  async sendCommerceNotification(
    email: string,
    orderId: string,
    customerName: string,
    items: number,
    amount: number,
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: '¡Tienes una nueva orden! 📋 - DomiExpress',
      html: `
        <h1>¡Nueva Orden Recibida!</h1>
        <p>Hola,</p>
        <p>Has recibido una nueva orden en DomiExpress:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>Orden ID:</strong></td>
            <td style="border: 1px solid #ddd; padding: 10px;">{{orderId}}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>Cliente:</strong></td>
            <td style="border: 1px solid #ddd; padding: 10px;">{{customerName}}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>Cantidad de Ítems:</strong></td>
            <td style="border: 1px solid #ddd; padding: 10px;">{{items}}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>Monto:</strong></td>
            <td style="border: 1px solid #ddd; padding: 10px;">${{ amount }}</td>
          </tr>
        </table>
        <p><a href="https://dashboard.domiexpress.co/orders/{{orderId}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Ver Orden</a></p>
        <hr>
        <p>DomiExpress 🚚</p>
      `,
      text: `Nueva Orden\nOrden: {{orderId}}\nCliente: {{customerName}}\nÍtems: {{items}}\nMonto: ${{ amount }}`,
    };

    const result = await this.sendEmail(email, template, {
      orderId,
      customerName,
      items: items.toString(),
      amount: amount.toLocaleString('es-CO'),
    });

    return result.success;
  }
}
