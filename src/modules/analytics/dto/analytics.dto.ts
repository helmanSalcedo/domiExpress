export class DailyMetricsDto {
  date!: string;
  totalOrders!: number;
  totalRevenue!: number;
  averageOrderValue!: number;
  activeCustomers!: number;
  activeCommerces!: number;
  activeDrivers!: number;
}

export class PeriodStatsDto {
  startDate!: Date;
  endDate!: Date;
  totalOrders!: number;
  totalRevenue!: number;
  averageOrderValue!: number;
  totalDeliveries!: number;
  completedDeliveries!: number;
  failedDeliveries!: number;
  averageDeliveryTime!: number;
  newCustomers!: number;
  newCommerces!: number;
  newDrivers!: number;
}

export class RevenueBreakdownDto {
  totalRevenue!: number;
  orderRevenue!: number;
  deliveryFees!: number;
  platformFees!: number;
  refundsIssued!: number;
  netRevenue!: number;
}

export class TopPerformersDto {
  topCommerces!: Array<{
    commerceId: string;
    name: string;
    totalOrders: number;
    totalRevenue: number;
    rating: number;
  }>;
  topDrivers!: Array<{
    driverId: string;
    name: string;
    totalDeliveries: number;
    totalEarnings: number;
    rating: number;
  }>;
}

export class GrowthMetricsDto {
  ordersGrowthPercent!: number;
  revenueGrowthPercent!: number;
  customersGrowthPercent!: number;
  commercesGrowthPercent!: number;
  driversGrowthPercent!: number;
  deliveryTimeImprovement!: number;
}
