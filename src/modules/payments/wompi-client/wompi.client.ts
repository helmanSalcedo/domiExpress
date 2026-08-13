import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

interface WompiPaymentLinkResponse {
  data: {
    id: string;
    public_link: string;
    short_link: string;
    status: string;
  };
}

@Injectable()
export class WompiClient {
  private readonly logger = new Logger(WompiClient.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly environment: string;

  constructor() {
    this.apiKey = process.env.WOMPI_API_KEY || '';
    this.environment = process.env.WOMPI_ENVIRONMENT || 'sandbox';

    const baseURL =
      this.environment === 'production'
        ? 'https://api.wompi.co/v1'
        : 'https://sandbox.wompi.co/v1';

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async generatePaymentLink(
    reference: string,
    amountInCents: number,
    customerEmail: string,
    customerPhone: string,
    customerName: string,
    returnUrl?: string,
  ): Promise<{ paymentLink: string; wompiReference: string }> {
    try {
      const response = await this.client.post<WompiPaymentLinkResponse>('/checkout/payment_links', {
        reference,
        amount_in_cents: amountInCents,
        currency: 'COP',
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_name: customerName,
        return_url: returnUrl || `${process.env.APP_URL || 'http://localhost:3000'}/payments/success`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      this.logger.log(`Payment link generated for reference: ${reference}`);

      return {
        paymentLink: response.data.data.public_link,
        wompiReference: response.data.data.id,
      };
    } catch (error) {
      this.logger.error(`Failed to generate payment link: ${error}`);
      throw error;
    }
  }

  async getTransaction(transactionId: string) {
    try {
      const response = await this.client.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get transaction: ${error}`);
      throw error;
    }
  }

  async refundTransaction(transactionId: string, amountInCents: number, reason?: string) {
    try {
      const response = await this.client.post(`/transactions/${transactionId}/refunds`, {
        amount_in_cents: amountInCents,
        reason: reason || 'Customer refund request',
      });

      this.logger.log(`Refund processed for transaction: ${transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to refund transaction: ${error}`);
      throw error;
    }
  }

  validateWebhookSignature(_payload: string, _signature: string, _timestamp: string): boolean {
    // TODO: Implement signature validation using Wompi's secret key
    // This would involve HMAC-SHA256 validation
    this.logger.debug('Webhook signature validation placeholder');
    return true;
  }
}
