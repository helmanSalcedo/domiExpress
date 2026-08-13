import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateOrderDto, OrderStatus } from '../dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      findUnique: jest.fn(),
    },
    commerce: {
      findUnique: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    orderState: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const customerId = 'cust-123';
      const commerceId = 'comm-456';
      const productId = 'prod-789';

      const createOrderDto: CreateOrderDto = {
        commerceId,
        items: [{ productId, quantity: 2, customizationText: 'Sin cebolla' }],
        customerLatitude: 4.7110,
        customerLongitude: -74.0076,
        notes: 'Entregar rápido',
      };

      const mockCustomer = {
        id: customerId,
        phone: '3001234567',
        municipalityId: 'mun-123',
      };

      const mockCommerce = {
        id: commerceId,
        isActive: true,
        estimatedPrepTimeMinutes: 20,
      };

      const mockProduct = {
        id: productId,
        basePrice: 15000,
        stockStatus: 'IN_STOCK',
      };

      const mockOrder = {
        id: 'ord-123',
        reference: 'ORD-123456-ABC',
        customerId,
        municipalityId: 'mun-123',
        status: OrderStatus.PENDING,
        subtotal: 30000,
        taxAmount: 5700,
        deliveryFee: 5000,
        discountAmount: 0,
        totalAmount: 40700,
        items: [
          {
            commerceId,
            productId,
            quantity: 2,
            unitPrice: 15000,
            subtotal: 30000,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.commerce.findUnique.mockResolvedValue(mockCommerce);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);
      mockPrismaService.orderState.create.mockResolvedValue({});

      const result = await service.createOrder(customerId, createOrderDto);

      expect(result).toBeDefined();
      expect(result.reference).toMatch(/^ORD-/);
      expect(result.status).toBe(OrderStatus.PENDING);
      expect(result.totalAmount).toBeGreaterThan(0);
      expect(mockPrismaService.customer.findUnique).toHaveBeenCalledWith({
        where: { id: customerId },
      });
      expect(mockPrismaService.commerce.findUnique).toHaveBeenCalledWith({
        where: { id: commerceId },
      });
    });

    it('should throw NotFoundException if customer not found', async () => {
      const customerId = 'invalid-cust';
      const createOrderDto: CreateOrderDto = {
        commerceId: 'comm-456',
        items: [{ productId: 'prod-789', quantity: 1 }],
        customerLatitude: 4.7110,
        customerLongitude: -74.0076,
      };

      mockPrismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.createOrder(customerId, createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if commerce not found', async () => {
      const customerId = 'cust-123';
      const commerceId = 'invalid-comm';

      const createOrderDto: CreateOrderDto = {
        commerceId,
        items: [{ productId: 'prod-789', quantity: 1 }],
        customerLatitude: 4.7110,
        customerLongitude: -74.0076,
      };

      const mockCustomer = { id: customerId, municipalityId: 'mun-123' };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.commerce.findUnique.mockResolvedValue(null);

      await expect(service.createOrder(customerId, createOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if commerce is inactive', async () => {
      const customerId = 'cust-123';
      const commerceId = 'comm-456';

      const createOrderDto: CreateOrderDto = {
        commerceId,
        items: [{ productId: 'prod-789', quantity: 1 }],
        customerLatitude: 4.7110,
        customerLongitude: -74.0076,
      };

      const mockCustomer = { id: customerId, municipalityId: 'mun-123' };
      const mockCommerce = { id: commerceId, isActive: false };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.commerce.findUnique.mockResolvedValue(mockCommerce);

      await expect(service.createOrder(customerId, createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if items array is empty', async () => {
      const customerId = 'cust-123';
      const commerceId = 'comm-456';

      const createOrderDto: CreateOrderDto = {
        commerceId,
        items: [],
        customerLatitude: 4.7110,
        customerLongitude: -74.0076,
      };

      const mockCustomer = { id: customerId, municipalityId: 'mun-123' };
      const mockCommerce = { id: commerceId, isActive: true };

      mockPrismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrismaService.commerce.findUnique.mockResolvedValue(mockCommerce);

      await expect(service.createOrder(customerId, createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getOrder', () => {
    it('should return order details', async () => {
      const orderId = 'ord-123';
      const customerId = 'cust-123';

      const mockOrder = {
        id: orderId,
        reference: 'ORD-123456',
        customerId,
        status: OrderStatus.PENDING,
        totalAmount: 40700,
        items: [
          {
            id: 'item-1',
            productId: 'prod-789',
            product: { name: 'Hamburguesa' },
            quantity: 2,
            unitPrice: 15000,
            subtotal: 30000,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getOrder(orderId, customerId);

      expect(result).toBeDefined();
      expect(result.id).toBe(orderId);
      expect(result.status).toBe(OrderStatus.PENDING);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrder('invalid-ord')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if customerId does not match', async () => {
      const orderId = 'ord-123';
      const customerId = 'cust-123';
      const wrongCustomerId = 'cust-999';

      const mockOrder = {
        id: orderId,
        customerId,
        status: OrderStatus.PENDING,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.getOrder(orderId, wrongCustomerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const orderId = 'ord-123';
      const updateDto: UpdateOrderStatusDto = {
        status: OrderStatus.CONFIRMED,
        notes: 'Order confirmed',
      };

      const mockOrder = {
        id: orderId,
        status: OrderStatus.PENDING,
        items: [],
      };

      const mockUpdatedOrder = {
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
        confirmedAt: new Date(),
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue(mockUpdatedOrder);
      mockPrismaService.orderState.create.mockResolvedValue({});

      const result = await service.updateOrderStatus(orderId, updateDto);

      expect(result.status).toBe(OrderStatus.CONFIRMED);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: expect.objectContaining({
          status: OrderStatus.CONFIRMED,
        }),
        include: { items: true },
      });
    });

    it('should throw error on invalid status transition', async () => {
      const orderId = 'ord-123';
      const updateDto: UpdateOrderStatusDto = {
        status: OrderStatus.PENDING, // Invalid: DELIVERED → PENDING
      };

      const mockOrder = {
        id: orderId,
        status: OrderStatus.DELIVERED,
        items: [],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.updateOrderStatus(orderId, updateDto)).rejects.toThrow();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const orderId = 'ord-123';
      const customerId = 'cust-123';

      const mockOrder = {
        id: orderId,
        customerId,
        status: OrderStatus.PENDING,
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });
      mockPrismaService.orderState.create.mockResolvedValue({});

      const result = await service.cancelOrder(orderId, customerId);

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw error if order cannot be cancelled', async () => {
      const orderId = 'ord-123';
      const customerId = 'cust-123';

      const mockOrder = {
        id: orderId,
        customerId,
        status: OrderStatus.DELIVERING, // Cannot cancel
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.cancelOrder(orderId, customerId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('listCustomerOrders', () => {
    it('should return list of customer orders', async () => {
      const customerId = 'cust-123';

      const mockOrders = [
        {
          id: 'ord-1',
          reference: 'ORD-001',
          customerId,
          status: OrderStatus.DELIVERED,
          totalAmount: 40700,
          items: [],
          createdAt: new Date(),
        },
        {
          id: 'ord-2',
          reference: 'ORD-002',
          customerId,
          status: OrderStatus.PENDING,
          totalAmount: 30000,
          items: [],
          createdAt: new Date(),
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.listCustomerOrders(customerId);

      expect(result).toHaveLength(2);
      expect(result[0].reference).toBe('ORD-001');
      expect(result[1].reference).toBe('ORD-002');
    });
  });
});
