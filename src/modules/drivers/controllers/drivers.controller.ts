import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { DriversService } from '../services/drivers.service';
import { RegisterDriverDto, UpdateDriverDto, DriverResponseDto, StartShiftDto, ShiftResponseDto } from '../dto';

@ApiTags('Drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new driver' })
  @ApiCreatedResponse({ type: DriverResponseDto })
  async registerDriver(
    @Body() dto: RegisterDriverDto,
    @Query('municipalityId') municipalityId: string,
  ): Promise<DriverResponseDto> {
    return this.driversService.registerDriver(municipalityId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get driver profile' })
  @ApiOkResponse({ type: DriverResponseDto })
  async getDriver(@Param('id') driverId: string): Promise<DriverResponseDto> {
    return this.driversService.getDriver(driverId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update driver profile' })
  @ApiOkResponse({ type: DriverResponseDto })
  async updateDriver(
    @Param('id') driverId: string,
    @Body() dto: UpdateDriverDto,
  ): Promise<DriverResponseDto> {
    return this.driversService.updateDriver(driverId, dto);
  }

  @Post(':id/shift/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start driver shift' })
  @ApiOkResponse({ type: ShiftResponseDto })
  async startShift(
    @Param('id') driverId: string,
    @Body() dto: StartShiftDto,
  ): Promise<ShiftResponseDto> {
    return this.driversService.startShift(driverId, dto);
  }

  @Post(':id/shift/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End driver shift' })
  @ApiOkResponse({ type: ShiftResponseDto })
  async endShift(
    @Param('id') driverId: string,
    @Body() dto: any,
  ): Promise<ShiftResponseDto> {
    return this.driversService.endShift(driverId, dto);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby drivers' })
  async getNearbyDrivers(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius: string = '5',
  ) {
    return this.driversService.listNearbyDrivers(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius),
    );
  }
}
