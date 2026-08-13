import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import {
  CreateDisputeDto,
  ResolveDisputeDto,
  DisputeResponseDto,
  DisputeStatsDto,
  DisputeStatus,
} from '../dto/index';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  async createDispute(orderId: string, dto: CreateDisputeDto): Promise<DisputeResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const existingDispute = await this.prisma.dispute.findFirst({
      where: { orderId },
    });

    if (existingDispute) {
      throw new BadRequestException('This order already has an open dispute');
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        orderId,
        reason: dto.reason,
        description: dto.description,
        status: DisputeStatus.OPEN,
      },
    });

    return this.formatDispute(dispute);
  }

  async getDispute(disputeId: string): Promise<DisputeResponseDto> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return this.formatDispute(dispute);
  }

  async listOrderDisputes(orderId: string): Promise<DisputeResponseDto[]> {
    const disputes = await this.prisma.dispute.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return disputes.map((d) => this.formatDispute(d));
  }

  async listAllDisputes(
    status?: DisputeStatus,
    skip = 0,
    take = 20,
  ): Promise<DisputeResponseDto[]> {
    const disputes = await this.prisma.dispute.findMany({
      where: {
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    return disputes.map((d) => this.formatDispute(d));
  }

  async resolveDispute(
    disputeId: string,
    dto: ResolveDisputeDto,
  ): Promise<DisputeResponseDto> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const updated = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: dto.status,
        resolution: dto.resolution,
        resolvedBy: dto.resolvedBy,
        resolvedAt: new Date(),
      },
    });

    return this.formatDispute(updated);
  }

  async getDisputeStats(municipalityId?: string): Promise<DisputeStatsDto> {
    const where = municipalityId
      ? {
          order: { municipalityId },
        }
      : {};

    const allDisputes = await this.prisma.dispute.findMany({ where });

    const openDisputes = allDisputes.filter((d) => d.status === DisputeStatus.OPEN).length;
    const resolvedDisputes = allDisputes.filter(
      (d) => d.status === DisputeStatus.RESOLVED,
    ).length;
    const closedDisputes = allDisputes.filter((d) => d.status === DisputeStatus.CLOSED).length;

    let averageResolutionTime = 0;
    const resolvedWithTime = allDisputes.filter((d) => d.resolvedAt);
    if (resolvedWithTime.length > 0) {
      const totalTime = resolvedWithTime.reduce((sum, d) => {
        const createdTime = d.createdAt.getTime();
        const resolvedTime = (d.resolvedAt as Date).getTime();
        return sum + (resolvedTime - createdTime) / (1000 * 60 * 60);
      }, 0);
      averageResolutionTime = totalTime / resolvedWithTime.length;
    }

    return {
      totalDisputes: allDisputes.length,
      openDisputes,
      resolvedDisputes,
      closedDisputes,
      averageResolutionTime: Math.round(averageResolutionTime),
    };
  }

  private formatDispute(dispute: any): DisputeResponseDto {
    return {
      id: dispute.id,
      orderId: dispute.orderId,
      reason: dispute.reason,
      description: dispute.description || undefined,
      status: dispute.status as DisputeStatus,
      resolution: dispute.resolution || undefined,
      resolvedBy: dispute.resolvedBy || undefined,
      createdAt: dispute.createdAt,
      resolvedAt: dispute.resolvedAt || undefined,
    };
  }
}
