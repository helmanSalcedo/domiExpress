import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { createHmac } from 'crypto';

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
  private readonly webhookSecret: string;
  private readonly environment: string;

  constructor() {
    this.apiKey = process.env.WOMPI_API_KEY || '';
    this.webhookSecret = process.env.WOMPI_WEBHOOK_SECRET || '';
    this.environment = process.env.WOMPI_ENVIRONMENT || 'sandbox';

    const baseURL =
      this.environment === 'production' ? 'https://api.wompi.co/v1' : 'https://sandbox.wompi.co/v1';

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
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
      this.logger.log(
        `Generating payment link for reference: ${reference}, amount: ${amountInCents}COP`,
      );

      const response = await this.client.post<WompiPaymentLinkResponse>('/checkout/payment_links', {
        reference,
        amount_in_cents: amountInCents,
        currency: 'COP',
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_name: customerName,
        return_url:
          returnUrl || `${process.env.APP_URL || 'http://localhost:3000'}/payments/success`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      this.logger.log(`Payment link generated successfully. Wompi ID: ${response.data.data.id}`);

      return {
        paymentLink: response.data.data.public_link,
        wompiReference: response.data.data.id,
      };
    } catch (error) {
      this.handleError('generatePaymentLink', error);
    }
  }

  async getTransaction(transactionId: string) {
    try {
      this.logger.debug(`Fetching transaction: ${transactionId}`);
      const response = await this.client.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      this.handleError('getTransaction', error);
    }
  }

  async refundTransaction(transactionId: string, amountInCents: number, reason?: string) {
    try {
      this.logger.log(
        `Processing refund for transaction ${transactionId}, amount: ${amountInCents}COP, reason: ${reason || 'N/A'}`,
      );

      const response = await this.client.post(`/transactions/${transactionId}/refunds`, {
        amount_in_cents: amountInCents,
        reason: reason || 'Customer refund request',
      });

      this.logger.log(`Refund processed successfully for transaction: ${transactionId}`);
      return response.data;
    } catch (error) {
      this.handleError('refundTransaction', error);
    }
  }

  validateWebhookSignature(payload: string, signature: string, timestamp: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Webhook secret not configured, skipping validation');
      return true;
    }

    try {
      const data = `${timestamp}.${payload}`;
      const expectedSignature = createHmac('sha256', this.webhookSecret).update(data).digest('hex');

      const isValid = expectedSignature === signature;
      if (!isValid) {
        this.logger.warn('Invalid webhook signature detected');
      }
      return isValid;
    } catch (error) {
      this.logger.error(`Error validating webhook signature: ${error}`);
      return false;
    }
  }

  private handleError(method: string, error: any): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      this.logger.error(`${method} failed: Status ${status}, Data: ${JSON.stringify(data)}`);

      if (status === 401 || status === 403) {
        throw new BadRequestException('Invalid Wompi credentials or unauthorized');
      }
      if (status === 404) {
        throw new BadRequestException('Resource not found in Wompi');
      }
      if (status === 400) {
        throw new BadRequestException(`Invalid request: ${JSON.stringify(data)}`);
      }

      throw new BadRequestException(`Wompi API error: ${axiosError.message}`);
    }

    this.logger.error(`${method} failed with unknown error: ${error}`);
    throw new BadRequestException('Failed to process payment with Wompi');
  }
}
