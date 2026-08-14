import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import {
  CreateRatingDto,
  RatingResponseDto,
  RatingType,
  DriverRatingDto,
  CommerceRatingDto,
} from '../dto/index';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async createRating(customerId: string, dto: CreateRatingDto): Promise<RatingResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { delivery: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== customerId) {
      throw new BadRequestException('You can only rate your own orders');
    }

    // Check if already rated
    const existing = await this.prisma.rating.findFirst({
      where: { orderId: dto.orderId, customerId },
    });

    if (existing) {
      throw new BadRequestException('You have already rated this order');
    }

    const ratingType = dto.commerceId ? RatingType.COMMERCE : RatingType.DRIVER;

    const rating = await this.prisma.rating.create({
      data: {
        orderId: dto.orderId,
        customerId,
        commerceId: dto.commerceId,
        driverId: dto.driverId || order.delivery?.driverId,
        score: dto.score,
        review: dto.review,
        ratingType,
      },
    });

    // Update average ratings
    await this.updateAverageRatings(
      dto.commerceId || undefined,
      dto.driverId || order.delivery?.driverId,
    );

    return this.formatRating(rating);
  }

  async getOrderRating(orderId: string): Promise<RatingResponseDto | null> {
    const rating = await this.prisma.rating.findFirst({
      where: { orderId },
    });

    if (!rating) {
      return null;
    }

    return this.formatRating(rating);
  }

  async getDriverStats(driverId: string): Promise<DriverRatingDto> {
    const ratings = await this.prisma.rating.findMany({
      where: { driverId },
    });

    if (ratings.length === 0) {
      return {
        driverId,
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {
          one: 0,
          two: 0,
          three: 0,
          four: 0,
          five: 0,
        },
      };
    }

    const averageRating = ratings.reduce((sum: number, r: any) => sum + r.score, 0) / ratings.length;
    const distribution = {
      one: ratings.filter((r: any) => r.score === 1).length,
      two: ratings.filter((r: any) => r.score === 2).length,
      three: ratings.filter((r: any) => r.score === 3).length,
      four: ratings.filter((r: any) => r.score === 4).length,
      five: ratings.filter((r: any) => r.score === 5).length,
    };

    return {
      driverId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      ratingDistribution: distribution,
    };
  }

  async getCommerceStats(commerceId: string): Promise<CommerceRatingDto> {
    const ratings = await this.prisma.rating.findMany({
      where: { commerceId },
    });

    if (ratings.length === 0) {
      return {
        commerceId,
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {
          one: 0,
          two: 0,
          three: 0,
          four: 0,
          five: 0,
        },
      };
    }

    const averageRating = ratings.reduce((sum: number, r: any) => sum + r.score, 0) / ratings.length;
    const distribution = {
      one: ratings.filter((r: any) => r.score === 1).length,
      two: ratings.filter((r: any) => r.score === 2).length,
      three: ratings.filter((r: any) => r.score === 3).length,
      four: ratings.filter((r: any) => r.score === 4).length,
      five: ratings.filter((r: any) => r.score === 5).length,
    };

    return {
      commerceId,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      ratingDistribution: distribution,
    };
  }

  async getCommerceReviews(commerceId: string, skip = 0, take = 20): Promise<RatingResponseDto[]> {
    const ratings = await this.prisma.rating.findMany({
      where: { commerceId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return ratings.map((r: any) => this.formatRating(r));
  }

  async getDriverReviews(driverId: string, skip = 0, take = 20): Promise<RatingResponseDto[]> {
    const ratings = await this.prisma.rating.findMany({
      where: { driverId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return ratings.map((r: any) => this.formatRating(r));
  }

  private async updateAverageRatings(commerceId?: string, driverId?: string) {
    if (commerceId) {
      const ratings = await this.prisma.rating.findMany({
        where: { commerceId },
      });
      if (ratings.length > 0) {
        const average = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
        await this.prisma.commerce.update({
          where: { id: commerceId },
          data: { rating: average, totalReviews: ratings.length },
        });
      }
    }

    if (driverId) {
      const ratings = await this.prisma.rating.findMany({
        where: { driverId },
      });
      if (ratings.length > 0) {
        const average = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
        await this.prisma.driver.update({
          where: { id: driverId },
          data: { rating: average },
        });
      }
    }
  }

  private formatRating(rating: any): RatingResponseDto {
    return {
      id: rating.id,
      orderId: rating.orderId,
      customerId: rating.customerId,
      commerceId: rating.commerceId || undefined,
      driverId: rating.driverId || undefined,
      score: rating.score,
      review: rating.review || undefined,
      ratingType: rating.ratingType as RatingType,
      createdAt: rating.createdAt,
    };
  }
}
