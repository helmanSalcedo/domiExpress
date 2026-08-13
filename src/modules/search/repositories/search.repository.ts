import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';

@Injectable()
export class SearchRepository {
  constructor(private prisma: PrismaService) {}

  async searchByName(query: string, limit = 10, municipalityId?: string) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        commerce: {
          isActive: true,
          ...(municipalityId && { municipalityId }),
        },
        deletedAt: null,
      },
      include: {
        commerce: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: limit,
    });
  }

  async searchByAttributes(attributes: string[], limit = 10, municipalityId?: string) {
    return this.prisma.product.findMany({
      where: {
        OR: attributes.map(attr => ({
          OR: [
            {
              name: {
                contains: attr,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: attr,
                mode: 'insensitive',
              },
            },
          ],
        })),
        commerce: {
          isActive: true,
          ...(municipalityId && { municipalityId }),
        },
        deletedAt: null,
      },
      include: {
        commerce: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: limit,
    });
  }

  async getProductCategories(municipalityId?: string): Promise<string[]> {
    const products = await this.prisma.product.findMany({
      where: {
        commerce: {
          isActive: true,
          ...(municipalityId && { municipalityId }),
        },
        deletedAt: null,
        categoryId: { not: null },
      },
      select: {
        categoryId: true,
      },
      distinct: ['categoryId'],
    });

    return products.map(p => p.categoryId).filter(c => c !== null && c !== undefined) as string[];
  }

  async getPopularSearches(limit = 10): Promise<string[]> {
    const searches = await this.prisma.searchLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        query: true,
      },
      distinct: ['query'],
    });

    return searches.map(s => s.query);
  }

  async logSearch(query: string, municipalityId: string, resultCount: number) {
    await this.prisma.searchLog.create({
      data: {
        query,
        municipalityId,
        resultsCount: resultCount,
      },
    });
  }
}
