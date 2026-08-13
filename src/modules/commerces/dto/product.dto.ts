import { IsString, IsNumber, IsOptional, MaxLength, Min, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationTimeMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isVegan?: boolean;

  @IsOptional()
  @IsBoolean()
  isVegetarian?: boolean;

  @IsOptional()
  @IsBoolean()
  isSpicy?: boolean;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  stockStatus?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class ProductResponseDto {
  id!: string;
  commerceId!: string;
  name!: string;
  description?: string;
  basePrice!: number;
  sku?: string;
  imageUrl?: string;
  stockStatus!: string;
  rating!: number;
  isVegan!: boolean;
  isVegetarian!: boolean;
  isSpicy!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
