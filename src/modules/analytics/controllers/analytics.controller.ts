import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AnalyticsService } from '../services/analytics.service';
import {
  DailyMetricsDto,
  PeriodStatsDto,
  RevenueBreakdownDto,
  TopPerformersDto,
  GrowthMetricsDto,
} from '../dto/index';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily metrics' })
  @ApiOkResponse({ type: DailyMetricsDto })
  async getDailyMetrics(@Query('date') dateStr: string): Promise<DailyMetricsDto> {
    const date = new Date(dateStr);
    return this.analyticsService.getDailyMetrics(date);
  }

  @Get('period')
  @ApiOperation({ summary: 'Get period statistics' })
  @ApiOkResponse({ type: PeriodStatsDto })
  async getPeriodStats(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
    @Query('municipalityId') municipalityId?: string,
  ): Promise<PeriodStatsDto> {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    return this.analyticsService.getPeriodStats(startDate, endDate, municipalityId);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue breakdown' })
  @ApiOkResponse({ type: RevenueBreakdownDto })
  async getRevenueBreakdown(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
    @Query('municipalityId') municipalityId?: string,
  ): Promise<RevenueBreakdownDto> {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    return this.analyticsService.getRevenueBreakdown(startDate, endDate, municipalityId);
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Get top performers' })
  @ApiOkResponse({ type: TopPerformersDto })
  async getTopPerformers(
    @Query('limit') limit = 10,
    @Query('municipalityId') municipalityId?: string,
  ): Promise<TopPerformersDto> {
    return this.analyticsService.getTopPerformers(limit, municipalityId);
  }

  @Get('growth')
  @ApiOperation({ summary: 'Get growth metrics' })
  @ApiOkResponse({ type: GrowthMetricsDto })
  async getGrowthMetrics(
    @Query('previousStartDate') previousStartDateStr: string,
    @Query('previousEndDate') previousEndDateStr: string,
    @Query('currentStartDate') currentStartDateStr: string,
    @Query('currentEndDate') currentEndDateStr: string,
    @Query('municipalityId') municipalityId?: string,
  ): Promise<GrowthMetricsDto> {
    const previousStartDate = new Date(previousStartDateStr);
    const previousEndDate = new Date(previousEndDateStr);
    const currentStartDate = new Date(currentStartDateStr);
    const currentEndDate = new Date(currentEndDateStr);

    return this.analyticsService.getGrowthMetrics(
      previousStartDate,
      previousEndDate,
      currentStartDate,
      currentEndDate,
      municipalityId,
    );
  }
}
