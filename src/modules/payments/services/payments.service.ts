import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private wompiClient: WompiClient,
  ) {}

  async generatePaymentLink(
    customerId: string,
    dto: GeneratePaymentLinkDto,
  ): Promise<{ paymentLink: string; paymentId: string }> {
    this.logger.log(`Generating payment link for order: ${dto.orderId}, customer: ${customerId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { customer: true },
    });

    if (!order) {
      this.logger.warn(`Order not found: ${dto.orderId}`);
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      this.logger.warn(`Unauthorized access to order: ${dto.orderId} by customer: ${customerId}`);
      throw new NotFoundException('Order not found');
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId: dto.orderId, status: PaymentStatus.PENDING },
    });

    if (existingPayment) {
      this.logger.log(`Reusing existing pending payment: ${existingPayment.id}`);
      return {
        paymentLink: existingPayment.wompiReference || '',
        paymentId: existingPayment.id,
      };
    }

    const { paymentLink, wompiReference } = await this.wompiClient.generatePaymentLink(
      order.reference,
      Number(order.totalAmount) * 100,
      order.customer.email || 'customer@domiya.local',
      order.customer.phone || '',
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

    this.logger.log(`Payment link generated: ${payment.id}, Wompi ref: ${wompiReference}`);

    return { paymentLink, paymentId: payment.id };
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
    this.logger.log(`Processing webhook for reference: ${dto.reference}, status: ${dto.status}`);

    const payment = await this.prisma.payment.findFirst({
      where: { wompiReference: dto.reference },
      include: { order: true },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for reference: ${dto.reference}`);
      throw new NotFoundException('Payment not found');
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: dto.status,
        cardLastFour: dto.cardLastFour,
        fraudStatus: dto.errorMessage,
        approvedAt: dto.status === PaymentStatus.APPROVED ? new Date() : undefined,
      },
    });

    if (dto.status === PaymentStatus.APPROVED) {
      this.logger.log(`Payment approved: ${payment.id}, updating order to CONFIRMED`);
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      });
    }

    if (dto.status === PaymentStatus.FAILED || dto.status === PaymentStatus.DECLINED) {
      this.logger.warn(`Payment failed: ${payment.id}, status: ${dto.status}`);
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
    this.logger.log(`Refund requested for payment: ${dto.paymentId}, customer: ${customerId}`);

    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.order.customerId !== customerId) {
      this.logger.warn(`Unauthorized refund attempt for payment: ${dto.paymentId}`);
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.APPROVED) {
      throw new BadRequestException('Only approved payments can be refunded');
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

    this.logger.log(`Refund created: ${refund.id} for payment: ${payment.id}`);
    return refund;
  }
}
