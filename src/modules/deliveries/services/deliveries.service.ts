import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import {
  AssignDeliveryDto,
  CompleteDeliveryDto,
  DeliveryResponseDto,
  DeliveryStatus,
  UpdateDeliveryLocationDto,
} from '../dto';
import { DeliveryStateMachine } from '../state-machine/delivery.state-machine';

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService) {}

  async getDelivery(deliveryId: string): Promise<DeliveryResponseDto> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { orderId: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    return this.formatDelivery(delivery);
  }

  async assignDelivery(deliveryId: string, dto: AssignDeliveryDto): Promise<DeliveryResponseDto> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { orderId: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const currentStatus = delivery.status as DeliveryStatus;
    DeliveryStateMachine.validateTransition(currentStatus, DeliveryStatus.ASSIGNED);

    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (!driver.isActive) {
      throw new BadRequestException('Driver is not active');
    }

    const updated = await this.prisma.delivery.update({
      where: { orderId: deliveryId },
      data: {
        driverId: dto.driverId,
        status: DeliveryStatus.ASSIGNED,
      },
    });

    return this.formatDelivery(updated);
  }

  async pickupDelivery(deliveryId: string): Promise<DeliveryResponseDto> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { orderId: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const currentStatus = delivery.status as DeliveryStatus;
    DeliveryStateMachine.validateTransition(currentStatus, DeliveryStatus.PICKED_UP);

    const updated = await this.prisma.delivery.update({
      where: { orderId: deliveryId },
      data: {
        status: DeliveryStatus.PICKED_UP,
      },
    });

    return this.formatDelivery(updated);
  }

  async updateLocation(
    deliveryId: string,
    dto: UpdateDeliveryLocationDto,
  ): Promise<DeliveryResponseDto> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { orderId: deliveryId },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const updated = await this.prisma.delivery.update({
      where: { orderId: deliveryId },
      data: {
        status: DeliveryStatus.IN_TRANSIT,
        deliveryLocationLatitude: dto.latitude,
        deliveryLocationLongitude: dto.longitude,
      },
    });

    // TODO: Store location in Redis for real-time tracking
    // TODO: Notify customer of delivery location update

    return this.formatDelivery(updated);
  }

  async completeDelivery(
    deliveryId: string,
    _dto: CompleteDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { orderId: deliveryId },
      include: { order: true },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const currentStatus = delivery.status as DeliveryStatus;
    DeliveryStateMachine.validateTransition(currentStatus, DeliveryStatus.DELIVERED);

    const updated = await this.prisma.delivery.update({
      where: { orderId: deliveryId },
      data: {
        status: DeliveryStatus.DELIVERED,
      },
    });

    // Update order status to DELIVERED
    await this.prisma.order.update({
      where: { id: delivery.orderId },
      data: { status: 'DELIVERED' },
    });

    // TODO: Calculate earnings
    // TODO: Send completion notification

    return this.formatDelivery(updated);
  }

  async listDriverDeliveries(driverId: string, status?: DeliveryStatus, limit = 20, offset = 0) {
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        driverId,
        ...(status && { status }),
      },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return deliveries.map((d: any) => this.formatDelivery(d));
  }

  async listActiveDeliveries(limit = 20) {
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        status: { in: [DeliveryStatus.ASSIGNED, DeliveryStatus.IN_TRANSIT] },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return deliveries.map((d: any) => this.formatDelivery(d));
  }

  private formatDelivery(delivery: any): DeliveryResponseDto {
    return {
      id: delivery.id,
      orderId: delivery.orderId,
      driverId: delivery.driverId || undefined,
      status: delivery.status as DeliveryStatus,
      pickupLatitude: delivery.pickupLocationLatitude || undefined,
      pickupLongitude: delivery.pickupLocationLongitude || undefined,
      deliveryLatitude: delivery.deliveryLocationLatitude || undefined,
      deliveryLongitude: delivery.deliveryLocationLongitude || undefined,
      distanceKm: delivery.distanceKm ? Number(delivery.distanceKm) : undefined,
      estimatedMinutes: delivery.estimatedDurationMinutes || undefined,
      actualMinutes: delivery.actualDurationMinutes || undefined,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    };
  }
}
