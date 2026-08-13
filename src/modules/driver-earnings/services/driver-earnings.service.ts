import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { EarningsResponseDto, EarningsHistoryDto } from '../dto';

@Injectable()
export class DriverEarningsService {
  constructor(private prisma: PrismaService) {}

  async calculateEarnings(
    deliveryId: string,
    distanceKm: number,
    timeMinutes: number,
  ): Promise<EarningsResponseDto> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { orderId: deliveryId },
      include: { order: true },
    });

    if (!delivery || !delivery.driverId) {
      throw new NotFoundException('Delivery not found');
    }

    // Base fee: $2 per delivery
    const baseFee = 2.0;

    // Distance fee: $0.50 per km
    const distanceFee = Math.max(0, distanceKm * 0.5);

    // Time bonus: Extra $0.10 per minute after 20 minutes
    const timeBonus = Math.max(0, (timeMinutes - 20) * 0.1);

    // Rush hour bonus: 10% extra between 12-13 and 19-20 hours
    const currentHour = new Date().getHours();
    const rushHourBonus =
      (currentHour === 12 || currentHour === 19) ? (baseFee + distanceFee) * 0.1 : 0;

    const bonusFee = timeBonus + rushHourBonus;

    // Penalties: None for now
    const penaltyFee = 0;

    const totalAmount = baseFee + distanceFee + bonusFee - penaltyFee;

    // Create earning record
    const earning = await this.prisma.driverEarning.create({
      data: {
        driverId: delivery.driverId,
        deliveryId,
        baseFee,
        bonusFee,
        penaltyFee,
        totalAmount,
        status: 'PENDING',
      },
    });

    return this.formatEarning(earning);
  }

  async getEarnings(driverId: string): Promise<EarningsResponseDto[]> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const earnings = await this.prisma.driverEarning.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return earnings.map((e) => this.formatEarning(e));
  }

  async getEarningsHistory(driverId: string): Promise<EarningsHistoryDto> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const allEarnings = await this.prisma.driverEarning.findMany({
      where: { driverId },
    });

    const totalEarnings = allEarnings.reduce((sum, e) => sum + Number(e.totalAmount), 0);
    const totalDeliveries = allEarnings.length;
    const averageEarningPerDelivery =
      totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

    const currentDate = new Date();
    const currentMonthEarnings = await this.prisma.driverEarning.aggregate({
      where: {
        driverId,
        createdAt: {
          gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
        },
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    const lastEarning = await this.prisma.driverEarning.findFirst({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalEarnings,
      totalDeliveries,
      averageEarningPerDelivery,
      currentMonthEarnings: Number(currentMonthEarnings._sum.totalAmount || 0),
      currentMonthDeliveries: currentMonthEarnings._count,
      lastEarningDate: lastEarning?.createdAt,
    };
  }

  private formatEarning(earning: any): EarningsResponseDto {
    return {
      driverId: earning.driverId,
      deliveryId: earning.deliveryId,
      baseFee: earning.baseFee,
      bonusFee: earning.bonusFee || 0,
      penaltyFee: earning.penaltyFee || 0,
      totalAmount: earning.totalAmount,
      status: earning.status,
      paidAt: earning.paidAt || undefined,
      createdAt: earning.createdAt,
    };
  }
}
