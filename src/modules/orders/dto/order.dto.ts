import { OrderStatus } from './update-order-status.dto';

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customizationText?: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
  method?: string;
}

export interface DeliveryResponse {
  id: string;
  status: string;
  driverId: string;
}

export class DetailedOrderResponseDto {
  id!: string;
  reference!: string;
  customerId!: string;
  commerceId!: string;
  status!: OrderStatus;
  orderType!: string;
  customerPhone!: string;
  customerLocationLatitude!: number;
  customerLocationLongitude!: number;
  customerAddressText?: string;
  customerNotes?: string;
  subtotal!: number;
  taxAmount!: number;
  deliveryFee!: number;
  discountAmount!: number;
  totalAmount!: number;
  currency!: string;
  estimatedDeliveryMinutes?: number;
  items!: OrderItemResponse[];
  payment?: PaymentResponse;
  delivery?: DeliveryResponse;
  createdAt!: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  updatedAt!: Date;
}

export class ApplyDiscountDto {
  discountPercentage!: number;
  promoCode?: string;
}

export class OrderStatsDto {
  totalOrders!: number;
  totalRevenue!: number;
  averageOrderValue!: number;
  ordersByStatus!: Record<string, number>;
}
