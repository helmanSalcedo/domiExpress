import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '../dto';

export class OrderStateMachine {
  private static readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
    [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
    [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.FAILED],
    [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.FAILED]: [OrderStatus.CANCELLED],
  };

  static canTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): boolean {
    const validTransitions = this.VALID_TRANSITIONS[currentStatus];
    return validTransitions.includes(nextStatus);
  }

  static validateTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      throw new BadRequestException(`Cannot transition from ${currentStatus} to ${nextStatus}`);
    }
  }

  static isPending(status: OrderStatus): boolean {
    return status === OrderStatus.PENDING;
  }

  static isProcessing(status: OrderStatus): boolean {
    return [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP].includes(
      status,
    );
  }

  static isInTransit(status: OrderStatus): boolean {
    return status === OrderStatus.IN_TRANSIT;
  }

  static isCompleted(status: OrderStatus): boolean {
    return status === OrderStatus.COMPLETED;
  }

  static isCancelled(status: OrderStatus): boolean {
    return status === OrderStatus.CANCELLED;
  }

  static isFailed(status: OrderStatus): boolean {
    return status === OrderStatus.FAILED;
  }
}
