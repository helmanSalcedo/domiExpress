import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateOrderDto, OrderStatus, UpdateOrderStatusDto, OrderResponseDto } from '../dto';
import { OrderStateMachine } from '../state-machine/order.state-machine';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(customerId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const commerce = await this.prisma.commerce.findUnique({ where: { id: dto.commerceId } });
    if (!commerce) throw new NotFoundException('Commerce not found');

    if (!commerce.isActive) {
      throw new BadRequestException('Commerce is not active');
    }

    let totalAmount = 0;

    const order = await this.prisma.order.create({
      data: {
        reference: this.generateOrderReference(),
        customerId,
        municipalityId: customer.municipalityId,
        status: OrderStatus.PENDING,
        customerLocationLatitude: dto.customerLatitude,
        customerLocationLongitude: dto.customerLongitude,
        customerPhone: customer.phone,
        totalAmount,
        subtotal: 0,
        customerNotes: dto.notes,
        items: {
          create: await Promise.all(
            dto.items.map(async (item) => {
              const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
              });

              if (!product) {
                throw new NotFoundException(`Product ${item.productId} not found`);
              }

              const itemSubtotal = Number(product.basePrice) * item.quantity;
              totalAmount += itemSubtotal;

              return {
                commerceId: dto.commerceId,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: Number(product.basePrice),
                subtotal: itemSubtotal,
                customizationText: item.customizationText,
              };
            }),
          ),
        },
      },
    });

    // Update order with correct total and subtotal
    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: { totalAmount, subtotal: totalAmount },
      include: { items: true },
    });

    const commerceId = updatedOrder.items.length > 0 ? updatedOrder.items[0].commerceId : '';

    return {
      id: updatedOrder.id,
      reference: updatedOrder.reference,
      customerId: updatedOrder.customerId,
      commerceId,
      status: updatedOrder.status as OrderStatus,
      totalAmount: Number(updatedOrder.totalAmount),
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
    };
  }

  async getOrder(orderId: string, customerId?: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (customerId && order.customerId !== customerId) {
      throw new NotFoundException('Order not found');
    }

    const commerceId = order.items.length > 0 ? order.items[0].commerceId : '';

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

  async updateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const currentStatus = order.status as OrderStatus;
    OrderStateMachine.validateTransition(currentStatus, dto.status);

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
      },
    });

    // Get first commerce from orderItems
    const firstItem = await this.prisma.orderItem.findFirst({
      where: { orderId },
    });

    return {
      id: updated.id,
      reference: updated.reference,
      customerId: updated.customerId,
      commerceId: firstItem?.commerceId || '',
      status: updated.status as OrderStatus,
      totalAmount: Number(updated.totalAmount),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async listCustomerOrders(customerId: string, limit = 20, offset = 0) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { items: true },
    });

    return orders.map((order) => {
      const commerceId = order.items.length > 0 ? order.items[0].commerceId : '';
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
    });
  }

  async listCommerceOrders(commerceId: string, limit = 20, offset = 0) {
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
    });

    return orders.map((order) => ({
      id: order.id,
      reference: order.reference,
      customerId: order.customerId,
      commerceId,
      status: order.status as OrderStatus,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  }

  async cancelOrder(orderId: string, customerId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.customerId !== customerId) {
      throw new NotFoundException('Order not found');
    }

    return this.updateOrderStatus(orderId, { status: OrderStatus.CANCELLED });
  }

  private generateOrderReference(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }
}
