import { IsString, IsIn, IsOptional } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(Object.values(OrderStatus))
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class OrderResponseDto {
  id!: string;
  reference!: string;
  customerId!: string;
  commerceId!: string;
  status!: OrderStatus;
  totalAmount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
