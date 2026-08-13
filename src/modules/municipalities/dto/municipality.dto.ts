import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMunicipalityDto {
  @IsString()
  name!: string;

  @IsString()
  department!: string;

  @IsNumber()
  centerLatitude!: number;

  @IsNumber()
  centerLongitude!: number;

  @IsNumber()
  @IsOptional()
  coverageRadiusKm?: number;
}

export class UpdateMunicipalityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  coverageRadiusKm?: number;
}

export class MunicipalityResponseDto {
  id!: string;
  name!: string;
  department!: string;
  centerLatitude!: number;
  centerLongitude!: number;
  coverageRadiusKm!: number;
  maxDeliveryDistanceKm!: number;
  status!: string;
  isPublished!: boolean;
  activeCommerces!: number;
  activeDrivers!: number;
  dailyOrders!: number;
  monthlyRevenue!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class MunicipalityStatsDto {
  municipalityId!: string;
  municipalityName!: string;
  totalOrders!: number;
  totalRevenue!: number;
  averageOrderValue!: number;
  averageDeliveryTime!: number;
  activeDrivers!: number;
  completionRate!: number;
}
