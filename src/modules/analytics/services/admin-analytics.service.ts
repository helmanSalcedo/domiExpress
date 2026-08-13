import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(startDate?: Date, endDate?: Date) {
    this.logger.log('📊 Fetching dashboard metrics');

    const dateFilter = {};
    if (startDate) dateFilter['gte'] = startDate;
    if (endDate) dateFilter['lte'] = endDate;

    // Total orders
    const totalOrders = await this.prisma.order.count({
      where: dateFilter ? { createdAt: dateFilter } : {},
    });

    // Total revenue
    const orders = await this.prisma.order.findMany({
      where: dateFilter ? { createdAt: dateFilter } : {},
    });

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

    // Total deliveries completed
    const completedDeliveries = await this.prisma.delivery.count({
      where: {
        status: 'DELIVERED',
        ...(dateFilter && { completedAt: dateFilter }),
      },
    });

    // Total active drivers
    const activeDrivers = await this.prisma.driver.count({
      where: { isActive: true },
    });

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order status breakdown
    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Top commerce by orders
    const topCommerce = await this.prisma.order.groupBy({
      by: ['commerceId'],
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    return {
      totalOrders,
      totalRevenue: Math.round(totalRevenue),
      completedDeliveries,
      activeDrivers,
      averageOrderValue: Math.round(avgOrderValue),
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      topCommerce: topCommerce.map((c) => ({
        commerceId: c.commerceId,
        orderCount: c._count.id,
        totalRevenue: c._sum.totalAmount ? Number(c._sum.totalAmount) : 0,
      })),
    };
  }

  async getRevenueMetrics(days = 30) {
    this.logger.log(`📈 Fetching revenue metrics for last ${days} days`);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['COMPLETED', 'DELIVERED'] },
      },
      select: { totalAmount: true, createdAt: true },
    });

    // Group by day
    const dailyRevenue = new Map<string, number>();

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const current = dailyRevenue.get(dateKey) || 0;
      dailyRevenue.set(dateKey, current + Number(order.totalAmount));
    });

    return Array.from(dailyRevenue.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, revenue]) => ({
        date,
        revenue: Math.round(revenue),
      }));
  }

  async getDriverMetrics() {
    this.logger.log('👨‍✈️ Fetching driver metrics');

    const totalDrivers = await this.prisma.driver.count();
    const activeDrivers = await this.prisma.driver.count({ where: { isActive: true } });
    const verifiedDrivers = await this.prisma.driver.count({ where: { isVerified: true } });
    const suspendedDrivers = await this.prisma.driver.count({ where: { isSuspended: true } });

    // Top rated drivers
    const topDrivers = await this.prisma.driver.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true, rating: true, totalDeliveries: true },
      orderBy: { rating: 'desc' },
      take: 10,
    });

    // Average driver stats
    const drivers = await this.prisma.driver.findMany();
    const avgRating = drivers.length > 0
      ? drivers.reduce((sum, d) => sum + Number(d.rating), 0) / drivers.length
      : 0;

    const avgDeliveries = drivers.length > 0
      ? drivers.reduce((sum, d) => sum + d.totalDeliveries, 0) / drivers.length
      : 0;

    return {
      totalDrivers,
      activeDrivers,
      verifiedDrivers,
      suspendedDrivers,
      averageRating: Math.round(avgRating * 10) / 10,
      averageDeliveries: Math.round(avgDeliveries),
      topDrivers: topDrivers.map((d) => ({
        id: d.id,
        name: d.fullName,
        rating: Number(d.rating),
        deliveries: d.totalDeliveries,
      })),
    };
  }

  async getCommerceMetrics() {
    this.logger.log('🏪 Fetching commerce metrics');

    const totalCommerce = await this.prisma.commerce.count();
    const verifiedCommerce = await this.prisma.commerce.count({ where: { isVerified: true } });

    // Top commerce by revenue
    const topCommerce = await this.prisma.order.groupBy({
      by: ['commerceId'],
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
    });

    return {
      totalCommerce,
      verifiedCommerce,
      topCommerce: topCommerce.map((c) => ({
        commerceId: c.commerceId,
        orderCount: c._count.id,
        totalRevenue: c._sum.totalAmount ? Math.round(Number(c._sum.totalAmount)) : 0,
      })),
    };
  }

  async getCustomerMetrics() {
    this.logger.log('👥 Fetching customer metrics');

    const totalCustomers = await this.prisma.customer.count();
    const activeCustomers = await this.prisma.customer.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    // Customers by municipality
    const customersByMunicipality = await this.prisma.customer.groupBy({
      by: ['municipalityId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Average order per customer
    const customers = await this.prisma.customer.findMany({
      select: { id: true },
    });

    const orders = await this.prisma.order.findMany();
    const avgOrdersPerCustomer = customers.length > 0 ? orders.length / customers.length : 0;

    return {
      totalCustomers,
      activeCustomers,
      averageOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 100) / 100,
      topMunicipalities: customersByMunicipality.map((c) => ({
        municipalityId: c.municipalityId,
        customerCount: c._count.id,
      })),
    };
  }

  async getOrderTrendMetrics(days = 7) {
    this.logger.log(`📊 Fetching order trends for last ${days} days`);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, status: true, totalAmount: true },
    });

    // Group by day
    const dailyTrends = new Map<
      string,
      { orders: number; revenue: number; statuses: Record<string, number> }
    >();

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const current = dailyTrends.get(dateKey) || {
        orders: 0,
        revenue: 0,
        statuses: {},
      };

      current.orders++;
      current.revenue += Number(order.totalAmount);
      current.statuses[order.status] = (current.statuses[order.status] || 0) + 1;

      dailyTrends.set(dateKey, current);
    });

    return Array.from(dailyTrends.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date,
        orderCount: data.orders,
        revenue: Math.round(data.revenue),
        statuses: data.statuses,
      }));
  }
}
