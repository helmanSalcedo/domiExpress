export class OrderItemResponseDto {
  id!: string;
  orderId!: string;
  productId!: string;
  quantity!: number;
  unitPrice!: number;
  subtotal!: number;
  customizationText?: string;
  createdAt!: Date;
}
