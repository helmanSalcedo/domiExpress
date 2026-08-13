import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export enum RatingType {
  DRIVER = 'DRIVER',
  COMMERCE = 'COMMERCE',
}

export class CreateRatingDto {
  @IsString()
  orderId!: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  score!: number;

  @IsString()
  @IsOptional()
  review?: string;

  @IsString()
  @IsOptional()
  commerceId?: string;

  @IsString()
  @IsOptional()
  driverId?: string;
}

export class RatingResponseDto {
  id!: string;
  orderId!: string;
  customerId!: string;
  commerceId?: string;
  driverId?: string;
  score!: number;
  review?: string;
  ratingType!: RatingType;
  createdAt!: Date;
}

export class RatingStatsDto {
  averageRating!: number;
  totalRatings!: number;
  ratingDistribution!: {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
  };
}

export class DriverRatingDto extends RatingStatsDto {
  driverId!: string;
}

export class CommerceRatingDto extends RatingStatsDto {
  commerceId!: string;
}
