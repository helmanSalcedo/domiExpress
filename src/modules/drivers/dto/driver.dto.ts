import { IsString, IsPhoneNumber, IsNumber, IsOptional, MinLength, MaxLength } from 'class-validator';

export class RegisterDriverDto {
  @IsPhoneNumber('CO')
  phone!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  identificationNumber!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password!: string;

  @IsString()
  @MaxLength(50)
  vehicleType!: string; // MOTORCYCLE, CAR, VAN

  @IsOptional()
  @IsString()
  @MaxLength(50)
  licensePlate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  insurancePolicy?: string;
}

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  licensePlate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  insurancePolicy?: string;
}

export class DriverResponseDto {
  id!: string;
  phone!: string;
  fullName!: string;
  vehicleType!: string;
  rating!: number;
  isActive!: boolean;
  totalEarnings!: number;
  completedDeliveries!: number;
  createdAt!: Date;
}

export class StartShiftDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;
}

export class EndShiftDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;
}

export class ShiftResponseDto {
  id!: string;
  driverId!: string;
  startedAt!: Date;
  endedAt?: Date;
  status!: string;
}
