import { BadRequestException } from '@nestjs/common';
import { DeliveryStatus } from '../dto';

export class DeliveryStateMachine {
  private static readonly VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
    [DeliveryStatus.PENDING]: [DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED],
    [DeliveryStatus.ASSIGNED]: [DeliveryStatus.PICKED_UP, DeliveryStatus.CANCELLED],
    [DeliveryStatus.PICKED_UP]: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.CANCELLED],
    [DeliveryStatus.IN_TRANSIT]: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
    [DeliveryStatus.DELIVERED]: [],
    [DeliveryStatus.FAILED]: [DeliveryStatus.PENDING],
    [DeliveryStatus.CANCELLED]: [],
  };

  static canTransition(currentStatus: DeliveryStatus, nextStatus: DeliveryStatus): boolean {
    const validTransitions = this.VALID_TRANSITIONS[currentStatus];
    return validTransitions.includes(nextStatus);
  }

  static validateTransition(currentStatus: DeliveryStatus, nextStatus: DeliveryStatus): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      throw new BadRequestException(`Cannot transition from ${currentStatus} to ${nextStatus}`);
    }
  }

  static isPending(status: DeliveryStatus): boolean {
    return status === DeliveryStatus.PENDING;
  }

  static isAssigned(status: DeliveryStatus): boolean {
    return status === DeliveryStatus.ASSIGNED;
  }

  static isInTransit(status: DeliveryStatus): boolean {
    return status === DeliveryStatus.IN_TRANSIT;
  }

  static isDelivered(status: DeliveryStatus): boolean {
    return status === DeliveryStatus.DELIVERED;
  }

  static isFailed(status: DeliveryStatus): boolean {
    return status === DeliveryStatus.FAILED;
  }

  static isCancelled(status: DeliveryStatus): boolean {
    return status === DeliveryStatus.CANCELLED;
  }

  static isActive(status: DeliveryStatus): boolean {
    return ![DeliveryStatus.DELIVERED, DeliveryStatus.CANCELLED].includes(status);
  }
}
