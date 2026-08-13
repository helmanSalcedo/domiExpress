import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { WompiClient } from '../wompi-client/wompi.client';
import {
  GeneratePaymentLinkDto,
  PaymentStatus,
  PaymentResponseDto,
  PaymentWebhookDto,
  RefundRequestDto,
} from '../dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private wompiClient: WompiClient,
  ) {}

  async generatePaymentLink(
    customerId: string,
    dto: GeneratePaymentLinkDto,
  ): Promise<{ paymentLink: string; paymentId: string }> {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new NotFoundException('Order not found');
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId: dto.orderId, status: PaymentStatus.PENDING },
    });

    if (existingPayment) {
      return {
        paymentLink: existingPayment.wompiReference || '',
        paymentId: existingPayment.id,
      };
    }

    const { paymentLink, wompiReference } = await this.wompiClient.generatePaymentLink(
      order.reference,
      Number(order.totalAmount) * 100, // Convert to cents
      order.customer.email || 'customer@domiya.local',
      order.customer.phone,
      order.customer.name,
      dto.returnUrl,
    );

    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        wompiReference,
        amountInCents: BigInt(Number(order.totalAmount) * 100),
        status: PaymentStatus.PENDING,
      },
    });

    return {
      paymentLink,
      paymentId: payment.id,
    };
  }

  async getPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      id: payment.id,
      orderId: payment.orderId,
      wompiReference: payment.wompiReference,
      status: payment.status as PaymentStatus,
      amountInCents: Number(payment.amountInCents),
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  async processWebhook(dto: PaymentWebhookDto): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findFirst({
      where: { wompiReference: dto.reference },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: dto.status,
        cardLastFour: dto.cardLastFour,
        fraudStatus: dto.errorMessage || undefined,
      },
    });

    // If payment is completed, update order status
    if (dto.status === PaymentStatus.COMPLETED) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      });
    }

    // If payment failed, update order status
    if (dto.status === PaymentStatus.FAILED) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'FAILED' },
      });
    }

    return {
      id: updated.id,
      orderId: updated.orderId,
      wompiReference: updated.wompiReference,
      status: updated.status as PaymentStatus,
      amountInCents: Number(updated.amountInCents),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async requestRefund(customerId: string, dto: RefundRequestDto): Promise<any> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.order.customerId !== customerId) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    await this.wompiClient.refundTransaction(
      payment.wompiReference,
      Number(payment.amountInCents),
      dto.reason,
    );

    const refund = await this.prisma.refund.create({
      data: {
        paymentId: payment.id,
        amountInCents: payment.amountInCents,
        status: 'PENDING',
        reason: dto.reason || 'Customer refund request',
      },
    });

    return refund;
  }
}
