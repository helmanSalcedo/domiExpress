export class EarningsResponseDto {
  driverId!: string;
  deliveryId!: string;
  baseFee!: number;
  bonusFee?: number;
  penaltyFee?: number;
  totalAmount!: number;
  status!: string;
  paidAt?: Date;
  createdAt!: Date;
}

export class EarningsHistoryDto {
  totalEarnings!: number;
  totalDeliveries!: number;
  averageEarningPerDelivery!: number;
  currentMonthEarnings!: number;
  currentMonthDeliveries!: number;
  lastEarningDate?: Date;
}
