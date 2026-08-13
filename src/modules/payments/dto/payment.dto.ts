import { IsString, IsNumber, IsOptional, Min, IsEnum, IsNotEmpty } from 'class-validator';

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  TRANSFER = 'TRANSFER',
}

export class GeneratePaymentLinkDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountInCents?: number;

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;
}

export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  reference!: string;

  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @IsNumber()
  @Min(0)
  amountInCents!: number;

  @IsOptional()
  @IsString()
  cardLastFour?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}

export class RefundRequestDto {
  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class PaymentResponseDto {
  id!: string;
  orderId!: string;
  wompiReference!: string;
  status!: PaymentStatus;
  amountInCents!: number;
  cardLastFour?: string;
  paymentMethod?: PaymentMethod;
  createdAt!: Date;
  updatedAt!: Date;
  approvedAt?: Date;
  failureReason?: string;
}

export class PaymentLinkResponseDto {
  paymentLink!: string;
  paymentId!: string;
  expiresAt?: Date;
}
