import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { ClaudeClient } from '../claude-client/claude.client';
import { SearchRepository } from '../repositories/search.repository';
import { SearchQueryDto, SearchResultDto, ProcessMessageDto, MessageIntentDto } from '../dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private prisma: PrismaService,
    private claudeClient: ClaudeClient,
    private searchRepository: SearchRepository,
  ) {}

  async searchProducts(dto: SearchQueryDto): Promise<SearchResultDto[]> {
    try {
      this.logger.debug(`Searching for: ${dto.query}`);

      // Log search for analytics
      if (dto.municipalityId) {
        this.searchRepository.logSearch(dto.query, dto.municipalityId, 0);
      }

      // Search by name and attributes
      const results = await this.searchRepository.searchByName(
        dto.query,
        dto.limit || 10,
        dto.municipalityId,
      );

      // Transform results
      return results.map((product: any) => ({
        productId: product.id,
        productName: product.name,
        description: product.description,
        price: Number(product.basePrice),
        commerce: {
          id: product.commerce.id,
          name: product.commerce.name,
        },
        similarity: 100, // Full text search doesn't provide similarity
        imageUrl: product.imageUrl,
      }));
    } catch (error) {
      this.logger.error(`Search failed: ${error}`);
      return [];
    }
  }

  async processMessage(dto: ProcessMessageDto): Promise<{
    intent: MessageIntentDto;
    results?: SearchResultDto[];
  }> {
    try {
      // Extract intent using Claude
      const intent = await this.claudeClient.extractSearchIntent(dto.message);

      this.logger.debug(`Detected intent: ${intent.intent}`);

      // If search intent, perform search
      if (intent.intent === 'search' && intent.query) {
        const searchResults = await this.searchProducts({
          query: intent.query,
          limit: 10,
          municipalityId: dto.municipalityId,
          threshold: 70,
        });

        return {
          intent,
          results: searchResults,
        };
      }

      return { intent };
    } catch (error) {
      this.logger.error(`Message processing failed: ${error}`);
      return {
        intent: {
          intent: 'error',
          entities: [],
          confidence: 0,
        },
      };
    }
  }

  async getSearchSuggestions(prefix: string, limit = 5): Promise<string[]> {
    try {
      const categories = await this.searchRepository.getProductCategories();

      // Filter categories matching prefix
      const suggestions = categories
        .filter((cat) => cat.toLowerCase().includes(prefix.toLowerCase()))
        .slice(0, limit);

      // Add popular searches if not enough categories
      if (suggestions.length < limit) {
        const popular = await this.searchRepository.getPopularSearches(limit - suggestions.length);
        suggestions.push(...popular);
      }

      return suggestions.slice(0, limit);
    } catch (error) {
      this.logger.error(`Failed to get suggestions: ${error}`);
      return [];
    }
  }

  async getRelatedProducts(productId: string, limit = 5): Promise<SearchResultDto[]> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product || !product.categoryId) {
        return [];
      }

      // Search by category
      const related = await this.prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: productId },
          deletedAt: null,
          commerce: { isActive: true },
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

      return related.map((p) => ({
        productId: p.id,
        productName: p.name,
        description: p.description || undefined,
        price: Number(p.basePrice),
        commerce: {
          id: p.commerce.id,
          name: p.commerce.name,
        },
        similarity: 80,
        imageUrl: p.imageUrl || undefined,
      }));
    } catch (error) {
      this.logger.error(`Failed to get related products: ${error}`);
      return [];
    }
  }

  async getPopularProducts(municipalityId?: string, limit = 10): Promise<SearchResultDto[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
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
        orderBy: { totalSold: 'desc' },
        take: limit,
      });

      return products.map((p) => ({
        productId: p.id,
        productName: p.name,
        description: p.description || undefined,
        price: Number(p.basePrice),
        commerce: {
          id: p.commerce.id,
          name: p.commerce.name,
        },
        similarity: 100,
        imageUrl: p.imageUrl || undefined,
      }));
    } catch (error) {
      this.logger.error(`Failed to get popular products: ${error}`);
      return [];
    }
  }
}
