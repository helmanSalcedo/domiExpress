import { IsString, IsNumber, IsOptional } from 'class-validator';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class AssignDeliveryDto {
  @IsString()
  driverId!: string;
}

export class UpdateDeliveryLocationDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsNumber()
  accuracyMeters?: number;
}

export class CompleteDeliveryDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;
}

export class DeliveryResponseDto {
  id!: string;
  orderId!: string;
  driverId?: string;
  status!: DeliveryStatus;
  pickupLatitude?: number;
  pickupLongitude?: number;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  distanceKm?: number;
  estimatedMinutes?: number;
  actualMinutes?: number;
  createdAt!: Date;
  updatedAt!: Date;
}
