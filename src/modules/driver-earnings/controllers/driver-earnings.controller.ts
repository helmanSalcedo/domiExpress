import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { DriverEarningsService } from '../services/driver-earnings.service';
import { EarningsResponseDto, EarningsHistoryDto } from '../dto';

@ApiTags('Driver Earnings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('drivers/:driverId/earnings')
export class DriverEarningsController {
  constructor(private readonly earningsService: DriverEarningsService) {}

  @Get()
  @ApiOperation({ summary: 'Get driver earnings list' })
  @ApiOkResponse({ type: [EarningsResponseDto] })
  async getEarnings(@Param('driverId') driverId: string): Promise<EarningsResponseDto[]> {
    return this.earningsService.getEarnings(driverId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get driver earnings history and summary' })
  @ApiOkResponse({ type: EarningsHistoryDto })
  async getEarningsHistory(@Param('driverId') driverId: string): Promise<EarningsHistoryDto> {
    return this.earningsService.getEarningsHistory(driverId);
  }
}
