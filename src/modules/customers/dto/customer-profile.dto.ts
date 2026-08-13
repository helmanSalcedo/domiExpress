import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CustomerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  preferredLanguage?: string;

  @IsOptional()
  homeLatitude?: number;

  @IsOptional()
  homeLongitude?: number;
}

export class CustomerResponseDto {
  id!: string;
  phone!: string;
  email?: string | null;
  name!: string;
  rating!: number;
  totalOrders!: number;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
