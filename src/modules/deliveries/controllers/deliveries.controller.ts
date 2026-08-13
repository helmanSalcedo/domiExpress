import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { DeliveriesService } from '../services/deliveries.service';
import {
  AssignDeliveryDto,
  UpdateDeliveryLocationDto,
  CompleteDeliveryDto,
  DeliveryResponseDto,
  DeliveryStatus,
} from '../dto';

@ApiTags('Deliveries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery status' })
  @ApiOkResponse({ type: DeliveryResponseDto })
  async getDelivery(@Param('id') deliveryId: string): Promise<DeliveryResponseDto> {
    return this.deliveriesService.getDelivery(deliveryId);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign driver to delivery' })
  @ApiOkResponse({ type: DeliveryResponseDto })
  async assignDelivery(
    @Param('id') deliveryId: string,
    @Body() dto: AssignDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    return this.deliveriesService.assignDelivery(deliveryId, dto);
  }

  @Post(':id/pickup')
  @ApiOperation({ summary: 'Mark delivery as picked up' })
  @ApiOkResponse({ type: DeliveryResponseDto })
  async pickupDelivery(@Param('id') deliveryId: string): Promise<DeliveryResponseDto> {
    return this.deliveriesService.pickupDelivery(deliveryId);
  }

  @Patch(':id/location')
  @ApiOperation({ summary: 'Update delivery location' })
  @ApiOkResponse({ type: DeliveryResponseDto })
  async updateLocation(
    @Param('id') deliveryId: string,
    @Body() dto: UpdateDeliveryLocationDto,
  ): Promise<DeliveryResponseDto> {
    return this.deliveriesService.updateLocation(deliveryId, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark delivery as completed' })
  @ApiOkResponse({ type: DeliveryResponseDto })
  async completeDelivery(
    @Param('id') deliveryId: string,
    @Body() dto: CompleteDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    return this.deliveriesService.completeDelivery(deliveryId, dto);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'List driver deliveries' })
  @ApiOkResponse({ type: [DeliveryResponseDto] })
  async listDriverDeliveries(
    @Param('driverId') driverId: string,
    @Query('status') status?: DeliveryStatus,
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    return this.deliveriesService.listDriverDeliveries(
      driverId,
      status,
      parseInt(limit),
      parseInt(offset),
    );
  }

  @Get('active')
  @ApiOperation({ summary: 'List active deliveries' })
  @ApiOkResponse({ type: [DeliveryResponseDto] })
  async listActiveDeliveries(@Query('limit') limit: string = '20') {
    return this.deliveriesService.listActiveDeliveries(parseInt(limit));
  }
}
