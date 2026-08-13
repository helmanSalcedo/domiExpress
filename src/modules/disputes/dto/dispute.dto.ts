import { IsString, IsOptional } from 'class-validator';

export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export class CreateDisputeDto {
  @IsString()
  orderId!: string;

  @IsString()
  reason!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ResolveDisputeDto {
  @IsString()
  status!: DisputeStatus;

  @IsString()
  @IsOptional()
  resolution?: string;

  @IsString()
  @IsOptional()
  resolvedBy?: string;
}

export class DisputeResponseDto {
  id!: string;
  orderId!: string;
  reason!: string;
  description?: string;
  status!: DisputeStatus;
  resolution?: string;
  resolvedBy?: string;
  createdAt!: Date;
  resolvedAt?: Date;
}

export class DisputeStatsDto {
  totalDisputes!: number;
  openDisputes!: number;
  resolvedDisputes!: number;
  closedDisputes!: number;
  averageResolutionTime!: number;
}
