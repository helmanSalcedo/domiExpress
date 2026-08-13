import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateOrderDto, OrderStatus, UpdateOrderStatusDto, OrderResponseDto } from '../dto';
import { OrderStateMachine } from '../state-machine/order.state-machine';

interface OrderCalculations {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  // Constants
  private readonly TAX_RATE = 0.19; // 19% IVA Colombia
  private readonly BASE_DELIVERY_FEE = 5000; // COP

  constructor(private prisma: PrismaService) {}

  async createOrder(customerId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    this.logger.log(`Creating order for customer: ${customerId}`);

    // Validar customer
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      this.logger.warn(`Customer not found: ${customerId}`);
      throw new NotFoundException('Customer not found');
    }

    // Validar comercio
    const commerce = await this.prisma.commerce.findUnique({
      where: { id: dto.commerceId },
    });
    if (!commerce) {
      this.logger.warn(`Commerce not found: ${dto.commerceId}`);
      throw new NotFoundException('Commerce not found');
    }

    if (!commerce.isActive) {
      throw new BadRequestException('Commerce is not active');
    }

    if (dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    // Validar productos y calcular subtotal
    const orderItems = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (product.stockStatus === 'OUT_OF_STOCK') {
          throw new BadRequestException(`Product ${product.name} is out of stock`);
        }

        return {
          commerceId: dto.commerceId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.basePrice,
          subtotal: product.basePrice * item.quantity,
          customizationText: item.customizationText,
          customizationExtraCost: 0,
        };
      }),
    );

    // Calcular totales
    const calculations = this.calculateOrderTotals(orderItems);

    // Crear orden
    const order = await this.prisma.order.create({
      data: {
        reference: this.generateOrderReference(),
        customerId,
        municipalityId: customer.municipalityId,
        status: OrderStatus.PENDING,
        orderType: 'DELIVERY',
        customerLocationLatitude: dto.customerLatitude,
        customerLocationLongitude: dto.customerLongitude,
        customerPhone: customer.phone,
        customerAddressText: dto.notes,
        customerNotes: dto.notes,
        subtotal: calculations.subtotal,
        taxAmount: calculations.tax,
        deliveryFee: calculations.deliveryFee,
        discountAmount: calculations.discount,
        totalAmount: calculations.total,
        currency: 'COP',
        estimatedDeliveryMinutes: commerce.estimatedPrepTimeMinutes + 30,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    this.logger.log(`Order created: ${order.reference} with total: ${calculations.total}`);

    // Registrar estado inicial
    await this.recordOrderStateChange(
      order.id,
      null,
      OrderStatus.PENDING,
      'Order created',
    );

    return this.mapToResponseDto(order);
  }

  async getOrder(orderId: string, customerId?: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            commerce: true,
          },
        },
        customer: true,
        payment: true,
        delivery: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (customerId && order.customerId !== customerId) {
      throw new NotFoundException('Order not found');
    }

    return this.mapToDetailedResponseDto(order);
  }

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const currentStatus = order.status as OrderStatus;

    // Validar transición de estado
    OrderStateMachine.validateTransition(currentStatus, dto.status);

    // Actualizar orden
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        ...(dto.status === OrderStatus.DELIVERED && {
          completedAt: new Date(),
        }),
        ...(dto.status === OrderStatus.CONFIRMED && {
          confirmedAt: new Date(),
        }),
        ...(dto.status === OrderStatus.CANCELLED && {
          cancelledAt: new Date(),
        }),
      },
      include: { items: true, customer: true },
    });

    // Registrar cambio de estado
    await this.recordOrderStateChange(
      orderId,
      currentStatus,
      dto.status,
      dto.notes || `Status changed to ${dto.status}`,
    );

    this.logger.log(`Order ${orderId} status updated: ${currentStatus} → ${dto.status}`);

    return this.mapToResponseDto(updated);
  }

  async listCustomerOrders(
    customerId: string,
    limit = 20,
    offset = 0,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { items: true, customer: true },
    });

    return orders.map((order) => this.mapToResponseDto(order));
  }

  async listCommerceOrders(
    commerceId: string,
    limit = 20,
    offset = 0,
  ): Promise<OrderResponseDto[]> {
    const orderIds = (
      await this.prisma.orderItem.findMany({
        where: { commerceId },
        select: { orderId: true },
        distinct: ['orderId'],
        take: limit,
        skip: offset,
      })
    ).map((oi) => oi.orderId);

    const orders = await this.prisma.order.findMany({
      where: { id: { in: orderIds } },
      orderBy: { createdAt: 'desc' },
      include: { items: true, customer: true },
    });

    return orders.map((order) => this.mapToResponseDto(order));
  }

  async getOrdersByStatus(
    status: OrderStatus,
    limit = 20,
    offset = 0,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { items: true, customer: true },
    });

    return orders.map((order) => this.mapToResponseDto(order));
  }

  async cancelOrder(orderId: string, customerId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new NotFoundException('Order not found');
    }

    // Solo se puede cancelar si está en estado PENDING o CONFIRMED
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status as OrderStatus)) {
      throw new BadRequestException('Cannot cancel order in current status');
    }

    return this.updateOrderStatus(orderId, {
      status: OrderStatus.CANCELLED,
      notes: 'Cancelled by customer',
    });
  }

  async getOrderHistory(orderId: string) {
    return this.prisma.orderState.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Private methods

  private calculateOrderTotals(items: any[]): OrderCalculations {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = Math.round(subtotal * this.TAX_RATE);
    const deliveryFee = this.BASE_DELIVERY_FEE;
    const discount = 0; // Implementar descuentos en el futuro

    return {
      subtotal,
      tax,
      deliveryFee,
      discount,
      total: subtotal + tax + deliveryFee - discount,
    };
  }

  private async recordOrderStateChange(
    orderId: string,
    previousStatus: OrderStatus | null,
    newStatus: OrderStatus,
    reason: string,
  ): Promise<void> {
    await this.prisma.orderState.create({
      data: {
        orderId,
        previousStatus,
        newStatus,
        reason,
        changedBy: 'system',
      },
    });
  }

  private generateOrderReference(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  private mapToResponseDto(order: any): OrderResponseDto {
    const commerceId = order.items?.length > 0 ? order.items[0].commerceId : '';

    return {
      id: order.id,
      reference: order.reference,
      customerId: order.customerId,
      commerceId,
      status: order.status as OrderStatus,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private mapToDetailedResponseDto(order: any) {
    return {
      id: order.id,
      reference: order.reference,
      customerId: order.customerId,
      commerceId: order.items?.length > 0 ? order.items[0].commerceId : '',
      status: order.status as OrderStatus,
      orderType: order.orderType,
      customerPhone: order.customerPhone,
      customerLocationLatitude: order.customerLocationLatitude,
      customerLocationLongitude: order.customerLocationLongitude,
      customerAddressText: order.customerAddressText,
      customerNotes: order.customerNotes,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      deliveryFee: Number(order.deliveryFee),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
      items: order.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        customizationText: item.customizationText,
      })),
      payment: order.payment ? {
        id: order.payment.id,
        status: order.payment.status,
        method: order.payment.paymentMethod,
      } : null,
      delivery: order.delivery ? {
        id: order.delivery.id,
        status: order.delivery.status,
        driverId: order.delivery.driverId,
      } : null,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
      updatedAt: order.updatedAt,
    };
  }
}
