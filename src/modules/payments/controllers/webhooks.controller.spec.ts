import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { PaymentsService } from '../services/payments.service';
import { DeliveriesService } from '@modules/deliveries/services/deliveries.service';
import { DriverAssignmentService } from '@modules/drivers/services/driver-assignment.service';
import { WompiClient } from '../wompi-client/wompi.client';
import { PaymentStatus } from '../dto';

describe('WebhooksController', () => {
  let controller: WebhooksController;

  const mockPaymentsService = {
    processWebhook: jest.fn(),
  };

  const mockDeliveriesService = {
    assignDelivery: jest.fn(),
  };

  const mockDriverAssignmentService = {
    assignNearestDriver: jest.fn(),
  };

  const mockWompiClient = {
    validateWebhookSignature: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        {
          provide: DeliveriesService,
          useValue: mockDeliveriesService,
        },
        {
          provide: DriverAssignmentService,
          useValue: mockDriverAssignmentService,
        },
        {
          provide: WompiClient,
          useValue: mockWompiClient,
        },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleWompiWebhook', () => {
    it('should reject webhook with invalid signature', async () => {
      mockWompiClient.validateWebhookSignature.mockReturnValue(false);

      const req = {
        headers: {
          'x-wompi-signature': 'invalid-sig',
          'x-wompi-timestamp': Date.now().toString(),
        },
        body: {
          reference: 'wompi-ref-1',
          status: PaymentStatus.APPROVED,
          amountInCents: 5000000,
        },
      };

      await expect(controller.handleWompiWebhook(req.body, req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should process approved payment webhook', async () => {
      mockWompiClient.validateWebhookSignature.mockReturnValue(true);

      mockPaymentsService.processWebhook.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: PaymentStatus.APPROVED,
        wompiReference: 'wompi-ref-1',
      });

      mockDriverAssignmentService.assignNearestDriver.mockResolvedValue({
        driverId: 'driver-1',
        distanceKm: 2.5,
      });

      mockDeliveriesService.assignDelivery.mockResolvedValue({
        id: 'deliv-1',
        status: 'ASSIGNED',
        driverId: 'driver-1',
      });

      const req = {
        headers: {
          'x-wompi-signature': 'valid-sig',
          'x-wompi-timestamp': Date.now().toString(),
        },
        body: {
          reference: 'wompi-ref-1',
          status: PaymentStatus.APPROVED,
          amountInCents: 5000000,
          cardLastFour: '4242',
        },
      };

      const result = await controller.handleWompiWebhook(req.body, req);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe('pay-1');
      expect(result.status).toBe(PaymentStatus.APPROVED);
      expect(mockPaymentsService.processWebhook).toHaveBeenCalledWith(req.body);
    });

    it('should handle approved payment and create delivery', async () => {
      mockWompiClient.validateWebhookSignature.mockReturnValue(true);

      mockPaymentsService.processWebhook.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: PaymentStatus.APPROVED,
        wompiReference: 'wompi-ref-1',
        amountInCents: 5000000,
      });

      mockDriverAssignmentService.assignNearestDriver.mockResolvedValue({
        driverId: 'driver-1',
        distanceKm: 3.2,
      });

      mockDeliveriesService.assignDelivery.mockResolvedValue({
        id: 'deliv-1',
        status: 'ASSIGNED',
        driverId: 'driver-1',
      });

      const req = {
        headers: {
          'x-wompi-signature': 'valid-sig',
          'x-wompi-timestamp': Date.now().toString(),
        },
        body: {
          reference: 'wompi-ref-1',
          status: PaymentStatus.APPROVED,
          amountInCents: 5000000,
        },
      };

      await controller.handleWompiWebhook(req.body, req);

      // Should attempt to assign driver
      expect(mockDriverAssignmentService.assignNearestDriver).toHaveBeenCalled();
      // Should attempt to assign delivery
      expect(mockDeliveriesService.assignDelivery).toHaveBeenCalled();
    });

    it('should process declined payment webhook', async () => {
      mockWompiClient.validateWebhookSignature.mockReturnValue(true);

      mockPaymentsService.processWebhook.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: PaymentStatus.DECLINED,
        wompiReference: 'wompi-ref-1',
      });

      const req = {
        headers: {
          'x-wompi-signature': 'valid-sig',
          'x-wompi-timestamp': Date.now().toString(),
        },
        body: {
          reference: 'wompi-ref-1',
          status: PaymentStatus.DECLINED,
          amountInCents: 5000000,
          errorMessage: 'Insufficient funds',
        },
      };

      const result = await controller.handleWompiWebhook(req.body, req);

      expect(result.success).toBe(true);
      expect(result.status).toBe(PaymentStatus.DECLINED);
      // Should NOT create delivery for declined payments
      expect(mockDeliveriesService.assignDelivery).not.toHaveBeenCalled();
    });

    it('should process refunded payment webhook', async () => {
      mockWompiClient.validateWebhookSignature.mockReturnValue(true);

      mockPaymentsService.processWebhook.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: PaymentStatus.REFUNDED,
        wompiReference: 'wompi-ref-1',
      });

      const req = {
        headers: {
          'x-wompi-signature': 'valid-sig',
          'x-wompi-timestamp': Date.now().toString(),
        },
        body: {
          reference: 'wompi-ref-1',
          status: PaymentStatus.REFUNDED,
          amountInCents: 5000000,
        },
      };

      const result = await controller.handleWompiWebhook(req.body, req);

      expect(result.success).toBe(true);
      expect(result.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should handle webhook with missing order (graceful error)', async () => {
      mockWompiClient.validateWebhookSignature.mockReturnValue(true);

      mockPaymentsService.processWebhook.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: PaymentStatus.APPROVED,
        wompiReference: 'wompi-ref-1',
      });

      // getOrderWithLocations would fail, but controller should handle gracefully
      mockDriverAssignmentService.assignNearestDriver.mockRejectedValue(
        new Error('Order not found'),
      );

      const req = {
        headers: {
          'x-wompi-signature': 'valid-sig',
          'x-wompi-timestamp': Date.now().toString(),
        },
        body: {
          reference: 'wompi-ref-1',
          status: PaymentStatus.APPROVED,
          amountInCents: 5000000,
        },
      };

      const result = await controller.handleWompiWebhook(req.body, req);

      // Should still return success for payment processing
      expect(result.success).toBe(true);
    });
  });

  describe('Webhook Signature Validation', () => {
    it('should validate correct signature', async () => {
      mockWompiClient.validateWebhookSignature.mockReturnValue(true);

      const req = {
        headers: {
          'x-wompi-signature': 'correct-sig',
          'x-wompi-timestamp': '1691920000',
        },
        body: {
          reference: 'wompi-ref-1',
          status: PaymentStatus.APPROVED,
          amountInCents: 5000000,
        },
      };

      // Should not throw
      mockPaymentsService.processWebhook.mockResolvedValue({
        id: 'pay-1',
        status: PaymentStatus.APPROVED,
        orderId: 'order-1',
      });

      const result = await controller.handleWompiWebhook(req.body, req);
      expect(result.success).toBe(true);
    });

    it('should reject tampered payload', async () => {
      mockWompiClient.validateWebhookSignature.mockReturnValue(false);

      const req = {
        headers: {
          'x-wompi-signature': 'signature-for-original',
          'x-wompi-timestamp': '1691920000',
        },
        body: {
          reference: 'wompi-ref-1',
          status: PaymentStatus.APPROVED,
          amountInCents: 5000000,
          // payload tampered - amount changed
        },
      };

      await expect(controller.handleWompiWebhook(req.body, req)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Idempotency', () => {
    it('should handle duplicate webhook calls', async () => {
      mockWompiClient.validateWebhookSignature.mockReturnValue(true);

      mockPaymentsService.processWebhook.mockResolvedValue({
        id: 'pay-1',
        orderId: 'order-1',
        status: PaymentStatus.APPROVED,
        wompiReference: 'wompi-ref-1',
      });

      const req = {
        headers: {
          'x-wompi-signature': 'valid-sig',
          'x-wompi-timestamp': Date.now().toString(),
        },
        body: {
          reference: 'wompi-ref-1',
          status: PaymentStatus.APPROVED,
          amountInCents: 5000000,
        },
      };

      // First call
      const result1 = await controller.handleWompiWebhook(req.body, req);

      // Second identical call (duplicate)
      const result2 = await controller.handleWompiWebhook(req.body, req);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.paymentId).toBe(result2.paymentId);
    });
  });
});
