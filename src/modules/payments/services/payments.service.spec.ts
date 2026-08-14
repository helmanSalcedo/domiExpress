import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { WompiClient } from '../wompi-client/wompi.client';
import { PrismaService } from '@shared/database/prisma.service';
import { PaymentStatus } from '../dto';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refund: {
      create: jest.fn(),
    },
  };

  const mockWompiClient = {
    generatePaymentLink: jest.fn(),
    refundTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: WompiClient,
          useValue: mockWompiClient,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePaymentLink', () => {
    it('should generate payment link successfully', async () => {
      const customerId = 'cust-1';
      const orderId = 'order-1';
      const totalAmount = 50000;

      mockPrismaService.order.findUnique.mockResolvedValue({
        id: orderId,
        reference: 'ORD-001',
        customerId,
        totalAmount,
        customer: {
          id: customerId,
          name: 'John Doe',
          email: 'john@test.com',
          phone: '3001234567',
        },
      });

      mockPrismaService.payment.findFirst.mockResolvedValue(null);

      mockWompiClient.generatePaymentLink.mockResolvedValue({
        paymentLink: 'https://sandbox.wompi.co/checkout/123',
        wompiReference: 'wompi-ref-1',
      });

      mockPrismaService.payment.create.mockResolvedValue({
        id: 'pay-1',
        orderId,
        wompiReference: 'wompi-ref-1',
        amountInCents: BigInt(5000000),
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.generatePaymentLink(customerId, { orderId });

      expect(result).toHaveProperty('paymentLink');
      expect(result).toHaveProperty('paymentId', 'pay-1');
      expect(mockWompiClient.generatePaymentLink).toHaveBeenCalledWith(
        'ORD-001',
        5000000,
        'john@test.com',
        '3001234567',
        'John Doe',
        undefined,
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.generatePaymentLink('cust-1', { orderId: 'invalid-order' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when customer does not own order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-1',
        customerId: 'different-customer',
        reference: 'ORD-001',
        totalAmount: 50000,
      });

      await expect(service.generatePaymentLink('cust-1', { orderId: 'order-1' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reuse existing pending payment', async () => {
      const customerId = 'cust-1';
      const orderId = 'order-1';

      mockPrismaService.order.findUnique.mockResolvedValue({
        id: orderId,
        customerId,
        reference: 'ORD-001',
        totalAmount: 50000,
        customer: { id: customerId, name: 'John Doe', email: 'john@test.com' },
      });

      mockPrismaService.payment.findFirst.mockResolvedValue({
        id: 'existing-pay-1',
        wompiReference: 'existing-wompi-ref',
      });

      const result = await service.generatePaymentLink(customerId, { orderId });

      expect(result.paymentId).toBe('existing-pay-1');
      expect(mockWompiClient.generatePaymentLink).not.toHaveBeenCalled();
    });
  });

  describe('getPayment', () => {
    it('should return payment details', async () => {
      const paymentId = 'pay-1';

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: paymentId,
        orderId: 'order-1',
        wompiReference: 'wompi-ref-1',
        status: PaymentStatus.APPROVED,
        amountInCents: BigInt(5000000),
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-15'),
      });

      const result = await service.getPayment(paymentId);

      expect(result.id).toBe(paymentId);
      expect(result.status).toBe(PaymentStatus.APPROVED);
      expect(result.amountInCents).toBe(5000000);
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(service.getPayment('invalid-payment')).rejects.toThrow(NotFoundException);
    });
  });

  describe('processWebhook', () => {
    it('should process approved payment webhook', async () => {
      const paymentId = 'pay-1';
      const orderId = 'order-1';

      mockPrismaService.payment.findFirst.mockResolvedValue({
        id: paymentId,
        orderId,
        wompiReference: 'wompi-ref-1',
        status: PaymentStatus.PENDING,
        order: { id: orderId, customerId: 'cust-1' },
      });

      mockPrismaService.payment.update.mockResolvedValue({
        id: paymentId,
        orderId,
        wompiReference: 'wompi-ref-1',
        status: PaymentStatus.APPROVED,
        amountInCents: BigInt(5000000),
        createdAt: new Date(),
        updatedAt: new Date(),
        approvedAt: new Date(),
      });

      const result = await service.processWebhook({
        reference: 'wompi-ref-1',
        status: PaymentStatus.APPROVED,
        amountInCents: 5000000,
      });

      expect(result.status).toBe(PaymentStatus.APPROVED);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      });
    });

    it('should process failed payment webhook', async () => {
      const paymentId = 'pay-1';
      const orderId = 'order-1';

      mockPrismaService.payment.findFirst.mockResolvedValue({
        id: paymentId,
        orderId,
        wompiReference: 'wompi-ref-1',
        status: PaymentStatus.PENDING,
        order: { id: orderId, customerId: 'cust-1' },
      });

      mockPrismaService.payment.update.mockResolvedValue({
        id: paymentId,
        orderId,
        wompiReference: 'wompi-ref-1',
        status: PaymentStatus.FAILED,
        amountInCents: BigInt(5000000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.processWebhook({
        reference: 'wompi-ref-1',
        status: PaymentStatus.FAILED,
        amountInCents: 5000000,
        errorMessage: 'Insufficient funds',
      });

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: 'FAILED' },
      });
    });

    it('should throw NotFoundException for invalid reference', async () => {
      mockPrismaService.payment.findFirst.mockResolvedValue(null);

      await expect(
        service.processWebhook({
          reference: 'invalid-ref',
          status: PaymentStatus.APPROVED,
          amountInCents: 5000000,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('requestRefund', () => {
    it('should create refund for approved payment', async () => {
      const customerId = 'cust-1';
      const paymentId = 'pay-1';

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: paymentId,
        wompiReference: 'wompi-ref-1',
        status: PaymentStatus.APPROVED,
        amountInCents: BigInt(5000000),
        order: { customerId, id: 'order-1' },
      });

      mockWompiClient.refundTransaction.mockResolvedValue({ success: true });

      mockPrismaService.refund.create.mockResolvedValue({
        id: 'refund-1',
        paymentId,
        amountInCents: BigInt(5000000),
        status: 'PENDING',
        reason: 'Customer request',
        createdAt: new Date(),
      });

      const result = await service.requestRefund(customerId, {
        paymentId,
        reason: 'Customer request',
      });

      expect(result.id).toBe('refund-1');
      expect(mockWompiClient.refundTransaction).toHaveBeenCalledWith(
        'wompi-ref-1',
        5000000,
        'Customer request',
      );
    });

    it('should throw BadRequestException for non-approved payment', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        status: PaymentStatus.PENDING,
        order: { customerId: 'cust-1' },
      });

      await expect(service.requestRefund('cust-1', { paymentId: 'pay-1' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when payment does not belong to customer', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'pay-1',
        status: PaymentStatus.APPROVED,
        order: { customerId: 'different-customer' },
      });

      await expect(service.requestRefund('cust-1', { paymentId: 'pay-1' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
