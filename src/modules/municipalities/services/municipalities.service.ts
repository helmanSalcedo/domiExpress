import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import {
  CreateMunicipalityDto,
  UpdateMunicipalityDto,
  MunicipalityResponseDto,
  MunicipalityStatsDto,
} from '../dto/index';

@Injectable()
export class MunicipalitiesService {
  constructor(private prisma: PrismaService) {}

  async createMunicipality(dto: CreateMunicipalityDto): Promise<MunicipalityResponseDto> {
    const existing = await this.prisma.municipality.findFirst({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('Municipality with this name already exists');
    }

    const municipality = await this.prisma.municipality.create({
      data: {
        name: dto.name,
        department: dto.department,
        centerLatitude: dto.centerLatitude,
        centerLongitude: dto.centerLongitude,
        coverageRadiusKm: dto.coverageRadiusKm || 5,
        status: 'ACTIVE',
      },
    });

    return this.formatMunicipality(municipality);
  }

  async getMunicipality(municipalityId: string): Promise<MunicipalityResponseDto> {
    const municipality = await this.prisma.municipality.findUnique({
      where: { id: municipalityId },
    });

    if (!municipality) {
      throw new NotFoundException('Municipality not found');
    }

    return this.formatMunicipality(municipality);
  }

  async listMunicipalities(skip = 0, take = 20): Promise<MunicipalityResponseDto[]> {
    const municipalities = await this.prisma.municipality.findMany({
      where: { status: 'ACTIVE' },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return municipalities.map(m => this.formatMunicipality(m));
  }

  async updateMunicipality(
    municipalityId: string,
    dto: UpdateMunicipalityDto,
  ): Promise<MunicipalityResponseDto> {
    const municipality = await this.prisma.municipality.findUnique({
      where: { id: municipalityId },
    });

    if (!municipality) {
      throw new NotFoundException('Municipality not found');
    }

    const updated = await this.prisma.municipality.update({
      where: { id: municipalityId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.coverageRadiusKm && { coverageRadiusKm: dto.coverageRadiusKm }),
      },
    });

    return this.formatMunicipality(updated);
  }

  async deactivateMunicipality(municipalityId: string): Promise<MunicipalityResponseDto> {
    const municipality = await this.prisma.municipality.findUnique({
      where: { id: municipalityId },
    });

    if (!municipality) {
      throw new NotFoundException('Municipality not found');
    }

    const updated = await this.prisma.municipality.update({
      where: { id: municipalityId },
      data: { status: 'CLOSED' },
    });

    return this.formatMunicipality(updated);
  }

  async getMunicipalityStats(municipalityId: string): Promise<MunicipalityStatsDto> {
    const municipality = await this.prisma.municipality.findUnique({
      where: { id: municipalityId },
    });

    if (!municipality) {
      throw new NotFoundException('Municipality not found');
    }

    const orders = await this.prisma.order.findMany({
      where: { municipalityId },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const deliveries = await this.prisma.delivery.findMany({
      where: {
        order: { municipalityId },
      },
      include: { order: true },
    });

    let averageDeliveryTime = 0;
    const completedDeliveries = deliveries.filter(d => d.completedAt);
    if (completedDeliveries.length > 0) {
      const totalTime = completedDeliveries.reduce((sum, d) => {
        const time = d.actualDurationMinutes || 0;
        return sum + time;
      }, 0);
      averageDeliveryTime = totalTime / completedDeliveries.length;
    }

    const activeDrivers = await this.prisma.driver.count({
      where: { municipalityId, isActive: true },
    });

    const completionRate =
      deliveries.length > 0 ? (completedDeliveries.length / deliveries.length) * 100 : 0;

    return {
      municipalityId,
      municipalityName: municipality.name,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      averageDeliveryTime,
      activeDrivers,
      completionRate,
    };
  }

  private formatMunicipality(municipality: any): MunicipalityResponseDto {
    return {
      id: municipality.id,
      name: municipality.name,
      department: municipality.department,
      centerLatitude: municipality.centerLatitude,
      centerLongitude: municipality.centerLongitude,
      coverageRadiusKm: municipality.coverageRadiusKm || 5,
      maxDeliveryDistanceKm: municipality.maxDeliveryDistanceKm || 10,
      status: municipality.status,
      isPublished: municipality.isPublished,
      activeCommerces: municipality.activeCommerces || 0,
      activeDrivers: municipality.activeDrivers || 0,
      dailyOrders: municipality.dailyOrders || 0,
      monthlyRevenue: Number(municipality.monthlyRevenue || 0),
      createdAt: municipality.createdAt,
      updatedAt: municipality.updatedAt,
    };
  }
}
