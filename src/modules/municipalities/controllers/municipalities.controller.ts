import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { MunicipalitiesService } from '../services/municipalities.service';
import {
  CreateMunicipalityDto,
  UpdateMunicipalityDto,
  MunicipalityResponseDto,
  MunicipalityStatsDto,
} from '../dto/index';

@ApiTags('Municipalities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('municipalities')
export class MunicipalitiesController {
  constructor(private readonly municipalitiesService: MunicipalitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new municipality' })
  @ApiCreatedResponse({ type: MunicipalityResponseDto })
  async createMunicipality(@Body() dto: CreateMunicipalityDto): Promise<MunicipalityResponseDto> {
    return this.municipalitiesService.createMunicipality(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all municipalities' })
  @ApiOkResponse({ type: [MunicipalityResponseDto] })
  async listMunicipalities(
    @Query('skip') skip = 0,
    @Query('take') take = 20,
  ): Promise<MunicipalityResponseDto[]> {
    return this.municipalitiesService.listMunicipalities(skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get municipality by ID' })
  @ApiOkResponse({ type: MunicipalityResponseDto })
  async getMunicipality(@Param('id') id: string): Promise<MunicipalityResponseDto> {
    return this.municipalitiesService.getMunicipality(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get municipality statistics' })
  @ApiOkResponse({ type: MunicipalityStatsDto })
  async getMunicipalityStats(@Param('id') id: string): Promise<MunicipalityStatsDto> {
    return this.municipalitiesService.getMunicipalityStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update municipality' })
  @ApiOkResponse({ type: MunicipalityResponseDto })
  async updateMunicipality(
    @Param('id') id: string,
    @Body() dto: UpdateMunicipalityDto,
  ): Promise<MunicipalityResponseDto> {
    return this.municipalitiesService.updateMunicipality(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate municipality' })
  @ApiOkResponse({ type: MunicipalityResponseDto })
  async deactivateMunicipality(@Param('id') id: string): Promise<MunicipalityResponseDto> {
    return this.municipalitiesService.deactivateMunicipality(id);
  }
}
