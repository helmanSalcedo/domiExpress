import { IsEmail, IsOptional, IsString, MaxLength, IsJSON } from 'class-validator';

export class CommerceProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsJSON()
  hours?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  heroImageUrl?: string;
}

export class CommerceResponseDto {
  id!: string;
  name!: string;
  whatsappNumber!: string;
  ownerEmail!: string;
  rating!: number;
  totalOrders!: number;
  isActive!: boolean;
  apiKey?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
