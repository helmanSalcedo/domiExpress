import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { DisputesService } from '../services/disputes.service';
import {
  CreateDisputeDto,
  ResolveDisputeDto,
  DisputeResponseDto,
  DisputeStatsDto,
  DisputeStatus,
} from '../dto/index';

@ApiTags('Disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post('orders/:orderId')
  @ApiOperation({ summary: 'Create a dispute for an order' })
  @ApiCreatedResponse({ type: DisputeResponseDto })
  async createDispute(
    @Param('orderId') orderId: string,
    @Body() dto: CreateDisputeDto,
  ): Promise<DisputeResponseDto> {
    return this.disputesService.createDispute(orderId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute by ID' })
  @ApiOkResponse({ type: DisputeResponseDto })
  async getDispute(@Param('id') id: string): Promise<DisputeResponseDto> {
    return this.disputesService.getDispute(id);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'List disputes for an order' })
  @ApiOkResponse({ type: [DisputeResponseDto] })
  async listOrderDisputes(@Param('orderId') orderId: string): Promise<DisputeResponseDto[]> {
    return this.disputesService.listOrderDisputes(orderId);
  }

  @Get()
  @ApiOperation({ summary: 'List all disputes (admin only)' })
  @ApiOkResponse({ type: [DisputeResponseDto] })
  async listAllDisputes(
    @Query('status') status?: DisputeStatus,
    @Query('skip') skip = 0,
    @Query('take') take = 20,
  ): Promise<DisputeResponseDto[]> {
    return this.disputesService.listAllDisputes(status, skip, take);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve a dispute' })
  @ApiOkResponse({ type: DisputeResponseDto })
  async resolveDispute(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ): Promise<DisputeResponseDto> {
    return this.disputesService.resolveDispute(id, dto);
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get dispute statistics' })
  @ApiOkResponse({ type: DisputeStatsDto })
  async getDisputeStats(
    @Query('municipalityId') municipalityId?: string,
  ): Promise<DisputeStatsDto> {
    return this.disputesService.getDisputeStats(municipalityId);
  }
}
