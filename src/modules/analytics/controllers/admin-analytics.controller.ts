import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminAnalyticsService } from '../services/admin-analytics.service';

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminAnalyticsController {
  constructor(private analyticsService: AdminAnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard metrics' })
  @ApiOkResponse({ description: 'Dashboard metrics' })
  async getDashboardMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.getDashboardMetrics(start, end);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue metrics' })
  @ApiOkResponse({ description: 'Revenue data by day' })
  async getRevenueMetrics(@Query('days') days = 30) {
    return this.analyticsService.getRevenueMetrics(days);
  }

  @Get('drivers')
  @ApiOperation({ summary: 'Get driver metrics' })
  @ApiOkResponse({ description: 'Driver statistics' })
  async getDriverMetrics() {
    return this.analyticsService.getDriverMetrics();
  }

  @Get('commerce')
  @ApiOperation({ summary: 'Get commerce metrics' })
  @ApiOkResponse({ description: 'Commerce statistics' })
  async getCommerceMetrics() {
    return this.analyticsService.getCommerceMetrics();
  }

  @Get('customers')
  @ApiOperation({ summary: 'Get customer metrics' })
  @ApiOkResponse({ description: 'Customer statistics' })
  async getCustomerMetrics() {
    return this.analyticsService.getCustomerMetrics();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get order trends' })
  @ApiOkResponse({ description: 'Order trend data' })
  async getOrderTrends(@Query('days') days = 7) {
    return this.analyticsService.getOrderTrendMetrics(days);
  }
}
