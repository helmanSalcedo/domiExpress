import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { RegisterDriverDto, UpdateDriverDto, DriverResponseDto, StartShiftDto, ShiftResponseDto } from '../dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async registerDriver(
    municipalityId: string,
    dto: RegisterDriverDto,
  ): Promise<DriverResponseDto> {
    const existing = await this.prisma.driver.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new BadRequestException('Driver with this phone already exists');
    }

    const existingIdentification = await this.prisma.driver.findUnique({
      where: { identificationNumber: dto.identificationNumber },
    });

    if (existingIdentification) {
      throw new BadRequestException('Driver with this identification already exists');
    }

    const driver = await this.prisma.driver.create({
      data: {
        municipalityId,
        phone: dto.phone,
        fullName: dto.fullName,
        identificationNumber: dto.identificationNumber,
        identificationType: 'CC',
        vehicleType: dto.vehicleType,
        vehicleLicensePlate: dto.licensePlate,
        insurancePolicyNumber: dto.insurancePolicy,
        isActive: true,
      },
    });

    return this.formatDriver(driver);
  }

  async getDriver(driverId: string): Promise<DriverResponseDto> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return this.formatDriver(driver);
  }

  async updateDriver(
    driverId: string,
    dto: UpdateDriverDto,
  ): Promise<DriverResponseDto> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const updated = await this.prisma.driver.update({
      where: { id: driverId },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.vehicleType && { vehicleType: dto.vehicleType }),
        ...(dto.licensePlate && { licensePlate: dto.licensePlate }),
        ...(dto.insurancePolicy && { insurancePolicy: dto.insurancePolicy }),
      },
    });

    return this.formatDriver(updated);
  }

  async startShift(driverId: string, _dto: StartShiftDto): Promise<ShiftResponseDto> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (!driver.isActive) {
      throw new BadRequestException('Driver account is not active');
    }

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { lastLocationUpdateAt: new Date() },
    });

    return {
      id: `shift_${Date.now()}`,
      driverId,
      startedAt: new Date(),
      status: 'ACTIVE',
    };
  }

  async endShift(driverId: string, _dto: any): Promise<ShiftResponseDto> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    await this.prisma.driver.update({
      where: { id: driverId },
      data: { lastLocationUpdateAt: null },
    });

    return {
      id: `shift_${Date.now()}`,
      driverId,
      startedAt: new Date(),
      endedAt: new Date(),
      status: 'ENDED',
    };
  }

  async listNearbyDrivers(_latitude: number, _longitude: number, _radiusKm = 5) {
    // TODO: Implement proximity search using PostGIS and location tracking
    return this.prisma.driver.findMany({
      where: {
        isActive: true,
        lastLocationUpdateAt: { not: null },
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        vehicleType: true,
        rating: true,
      },
    });
  }

  private formatDriver(driver: any): DriverResponseDto {
    return {
      id: driver.id,
      phone: driver.phone,
      fullName: driver.fullName,
      vehicleType: driver.vehicleType,
      rating: Number(driver.rating),
      isActive: driver.isActive,
      totalEarnings: Number(driver.totalEarnings || 0),
      completedDeliveries: driver.totalDeliveries || 0,
      createdAt: driver.createdAt,
    };
  }
}
