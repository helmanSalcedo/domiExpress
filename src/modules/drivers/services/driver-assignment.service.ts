import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';

@Injectable()
export class DriverAssignmentService {
  private readonly logger = new Logger(DriverAssignmentService.name);

  constructor(private prisma: PrismaService) {}

  async assignNearestDriver(
    deliveryId: string,
    pickupLat: number,
    pickupLng: number,
  ): Promise<{ driverId: string; distanceKm: number }> {
    this.logger.log(
      `Assigning nearest driver for delivery: ${deliveryId}, pickup: ${pickupLat},${pickupLng}`,
    );

    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: { include: { customer: true } } },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    const activeDrivers = await this.prisma.driver.findMany({
      where: {
        isActive: true,
        municipalityId: delivery.order.customer.municipalityId,
      },
      include: {
        _count: {
          select: { deliveries: { where: { status: { in: ['ASSIGNED', 'IN_TRANSIT'] } } } },
        },
      },
    });

    if (activeDrivers.length === 0) {
      this.logger.warn(
        `No active drivers found for municipality: ${delivery.order.customer.municipalityId}`,
      );
      throw new BadRequestException('No available drivers in this area');
    }

    const pickupLocationLat = delivery.pickupLocationLatitude;
    const pickupLocationLng = delivery.pickupLocationLongitude;

    const driversWithDistance = activeDrivers
      .map((driver: any) => {
        const distanceKm = this.calculateDistance(
          pickupLocationLat,
          pickupLocationLng,
          delivery.deliveryLocationLatitude,
          delivery.deliveryLocationLongitude,
        );
        return {
          driverId: driver.id,
          distanceKm,
          activeDeliveries: driver._count.deliveries,
          rating: Number(driver.rating || 4.5),
        };
      })
      .filter((d: any) => d.distanceKm <= 30)
      .sort((a: any, b: any) => {
        const scoreA = a.distanceKm * 2 - a.rating * 10 + a.activeDeliveries * 5;
        const scoreB = b.distanceKm * 2 - b.rating * 10 + b.activeDeliveries * 5;
        return scoreA - scoreB;
      });

    if (driversWithDistance.length === 0) {
      this.logger.warn(`No drivers within 30km for delivery: ${deliveryId}`);
      throw new BadRequestException('No drivers available within reasonable distance');
    }

    const nearest = driversWithDistance[0];
    this.logger.log(`Assigned driver ${nearest.driverId} for delivery ${deliveryId}`);

    return {
      driverId: nearest.driverId,
      distanceKm: nearest.distanceKm,
    };
  }

  async getAvailableDrivers(municipalityId: string, limit = 50) {
    this.logger.debug(`Getting available drivers in municipality: ${municipalityId}`);

    const drivers = await this.prisma.driver.findMany({
      where: {
        isActive: true,
        municipalityId,
      },
      include: {
        _count: {
          select: { deliveries: { where: { status: { in: ['ASSIGNED', 'IN_TRANSIT'] } } } },
        },
      },
      take: limit,
    });

    return drivers.map((d: any) => ({
      id: d.id,
      name: d.fullName,
      phone: d.phone,
      activeDeliveries: d._count.deliveries,
      rating: Number(d.rating || 4.5),
    }));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
