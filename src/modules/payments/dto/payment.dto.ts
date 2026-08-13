import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export class GeneratePaymentLinkDto {
  @IsString()
  orderId!: string;

  @IsNumber()
  @Min(0)
  amountInCents!: number;

  @IsOptional()
  @IsString()
  returnUrl?: string;
}

export class PaymentWebhookDto {
  @IsString()
  reference!: string;

  @IsString()
  @IsIn(Object.values(PaymentStatus))
  status!: PaymentStatus;

  @IsNumber()
  amountInCents!: number;

  @IsOptional()
  @IsString()
  cardLastFour?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class PaymentResponseDto {
  id!: string;
  orderId!: string;
  wompiReference!: string;
  status!: PaymentStatus;
  amountInCents!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class RefundRequestDto {
  @IsString()
  paymentId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
