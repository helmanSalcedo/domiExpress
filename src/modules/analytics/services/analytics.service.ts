import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import {
  DailyMetricsDto,
  GrowthMetricsDto,
  PeriodStatsDto,
  RevenueBreakdownDto,
  TopPerformersDto,
} from '../dto/index';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDailyMetrics(date: Date): Promise<DailyMetricsDto> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.subtotal || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const activeCustomers = await this.prisma.customer.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const activeCommerces = await this.prisma.commerce.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const activeDrivers = await this.prisma.driver.count({
      where: {
        lastLocationUpdateAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return {
      date: date.toISOString().split('T')[0],
      totalOrders,
      totalRevenue,
      averageOrderValue,
      activeCustomers,
      activeCommerces,
      activeDrivers,
    };
  }

  async getPeriodStats(
    startDate: Date,
    endDate: Date,
    municipalityId?: string,
  ): Promise<PeriodStatsDto> {
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const whereClause = municipalityId
      ? { municipalityId, createdAt: { gte: startDate, lte: endDate } }
      : { createdAt: { gte: startDate, lte: endDate } };

    const orders = await this.prisma.order.findMany({
      where: whereClause,
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.subtotal || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const deliveryWhere = municipalityId
      ? { order: { municipalityId }, createdAt: { gte: startDate, lte: endDate } }
      : { createdAt: { gte: startDate, lte: endDate } };

    const deliveries = await this.prisma.delivery.findMany({
      where: deliveryWhere,
      include: { order: true },
    });

    const totalDeliveries = deliveries.length;
    const completedDeliveries = deliveries.filter((d: any) => d.completedAt).length;
    const failedDeliveries = deliveries.filter((d: any) => d.status === 'FAILED').length;

    let averageDeliveryTime = 0;
    const completedWithTime = deliveries.filter((d: any) => d.actualDurationMinutes);
    if (completedWithTime.length > 0) {
      const totalTime = completedWithTime.reduce(
        (sum: number, d: any) => sum + (d.actualDurationMinutes || 0),
        0,
      );
      averageDeliveryTime = totalTime / completedWithTime.length;
    }

    const newCustomers = await this.prisma.customer.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const newCommerces = await this.prisma.commerce.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const newDrivers = await this.prisma.driver.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return {
      startDate,
      endDate,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalDeliveries,
      completedDeliveries,
      failedDeliveries,
      averageDeliveryTime,
      newCustomers,
      newCommerces,
      newDrivers,
    };
  }

  async getRevenueBreakdown(
    startDate: Date,
    endDate: Date,
    municipalityId?: string,
  ): Promise<RevenueBreakdownDto> {
    const whereClause = municipalityId
      ? { municipalityId, createdAt: { gte: startDate, lte: endDate } }
      : { createdAt: { gte: startDate, lte: endDate } };

    const orders = await this.prisma.order.findMany({
      where: whereClause,
    });

    const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.subtotal || 0), 0);
    const platformFees = totalRevenue * 0.1; // 10% platform fee
    const refundsIssued = 0; // TODO: Sum refunds from disputes

    return {
      totalRevenue,
      orderRevenue: totalRevenue,
      deliveryFees: 0, // TODO: Calculate from deliveries
      platformFees,
      refundsIssued,
      netRevenue: totalRevenue - platformFees - refundsIssued,
    };
  }

  async getTopPerformers(limit = 10, municipalityId?: string): Promise<TopPerformersDto> {
    const commerceWhere = municipalityId ? { municipalityId } : {};
    const topCommerces = await this.prisma.commerce.findMany({
      where: commerceWhere,
      take: limit,
      orderBy: { rating: 'desc' },
    });

    const commercesWithStats = await Promise.all(
      topCommerces.map(async (c: any) => {
        const orders = await this.prisma.order.count({
          where: { commerces: { some: { id: c.id } } },
        });
        const orderData = await this.prisma.order.findMany({
          where: { commerces: { some: { id: c.id } } },
          select: { subtotal: true },
        });
        const revenue = orderData.reduce((sum: number, o: any) => sum + Number(o.subtotal || 0), 0);

        return {
          commerceId: c.id,
          name: c.name,
          totalOrders: orders,
          totalRevenue: revenue,
          rating: Number(c.rating),
        };
      }),
    );

    const driverWhere = municipalityId ? { municipalityId } : {};
    const topDrivers = await this.prisma.driver.findMany({
      where: driverWhere,
      take: limit,
      orderBy: { rating: 'desc' },
    });

    const driversWithStats = await Promise.all(
      topDrivers.map(async (d: any) => {
        const deliveries = await this.prisma.delivery.count({
          where: { driverId: d.id },
        });
        const earnings = Number(d.totalEarnings || 0);

        return {
          driverId: d.id,
          name: d.fullName,
          totalDeliveries: deliveries,
          totalEarnings: earnings,
          rating: Number(d.rating),
        };
      }),
    );

    return {
      topCommerces: commercesWithStats,
      topDrivers: driversWithStats,
    };
  }

  async getGrowthMetrics(
    previousPeriodStart: Date,
    previousPeriodEnd: Date,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    municipalityId?: string,
  ): Promise<GrowthMetricsDto> {
    const previousStats = await this.getPeriodStats(
      previousPeriodStart,
      previousPeriodEnd,
      municipalityId,
    );
    const currentStats = await this.getPeriodStats(
      currentPeriodStart,
      currentPeriodEnd,
      municipalityId,
    );

    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      ordersGrowthPercent: calculateGrowth(currentStats.totalOrders, previousStats.totalOrders),
      revenueGrowthPercent: calculateGrowth(currentStats.totalRevenue, previousStats.totalRevenue),
      customersGrowthPercent: calculateGrowth(
        currentStats.newCustomers,
        previousStats.newCustomers,
      ),
      commercesGrowthPercent: calculateGrowth(
        currentStats.newCommerces,
        previousStats.newCommerces,
      ),
      driversGrowthPercent: calculateGrowth(currentStats.newDrivers, previousStats.newDrivers),
      deliveryTimeImprovement: previousStats.averageDeliveryTime - currentStats.averageDeliveryTime,
    };
  }
}
