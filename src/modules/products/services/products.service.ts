import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';

export interface CreateProductDto {
  commerceId: string;
  name: string;
  description?: string;
  basePrice: number;
  category: string;
  imageUrl?: string;
  available: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  basePrice?: number;
  category?: string;
  imageUrl?: string;
  available?: boolean;
}

export interface ProductResponseDto {
  id: string;
  commerceId: string;
  name: string;
  description?: string;
  basePrice: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    this.logger.log(`📦 Creating product: ${dto.name} for commerce: ${dto.commerceId}`);

    if (dto.basePrice < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    if (!dto.name || dto.name.length === 0) {
      throw new BadRequestException('Product name is required');
    }

    // Validate commerce exists
    const commerce = await this.prisma.commerce.findUnique({
      where: { id: dto.commerceId },
    });

    if (!commerce) {
      throw new NotFoundException('Commerce not found');
    }

    const product = await this.prisma.product.create({
      data: {
        commerceId: dto.commerceId,
        name: dto.name,
        description: dto.description,
        basePrice: dto.basePrice,
        category: dto.category,
        imageUrl: dto.imageUrl,
        available: dto.available !== undefined ? dto.available : true,
      },
    });

    this.logger.log(`✅ Product created: ${product.id}`);
    return this.formatProduct(product);
  }

  async getProduct(productId: string): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.formatProduct(product);
  }

  async getCommerceProducts(
    commerceId: string,
    category?: string,
    limit = 50,
    offset = 0,
  ): Promise<ProductResponseDto[]> {
    this.logger.debug(`Fetching products for commerce: ${commerceId}`);

    const where: any = { commerceId };
    if (category) {
      where.category = category;
    }

    const products = await this.prisma.product.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => this.formatProduct(p));
  }

  async updateProduct(productId: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    this.logger.log(`📝 Updating product: ${productId}`);

    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.basePrice !== undefined && dto.basePrice < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name,
        description: dto.description,
        basePrice: dto.basePrice,
        category: dto.category,
        imageUrl: dto.imageUrl,
        available: dto.available,
      },
    });

    this.logger.log(`✅ Product updated: ${productId}`);
    return this.formatProduct(updated);
  }

  async deleteProduct(productId: string): Promise<void> {
    this.logger.log(`🗑️ Deleting product: ${productId}`);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id: productId },
    });

    this.logger.log(`✅ Product deleted: ${productId}`);
  }

  async toggleAvailability(productId: string, available: boolean): Promise<ProductResponseDto> {
    this.logger.log(`🔄 Toggling availability for product: ${productId} to ${available}`);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { available },
    });

    this.logger.log(`✅ Availability toggled: ${productId}`);
    return this.formatProduct(updated);
  }

  async getProductsByCategory(
    commerceId: string,
    category: string,
  ): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        commerceId,
        category,
        available: true,
      },
      orderBy: { basePrice: 'asc' },
    });

    return products.map((p) => this.formatProduct(p));
  }

  async searchProducts(
    commerceId: string,
    query: string,
  ): Promise<ProductResponseDto[]> {
    this.logger.debug(`Searching products: ${query}`);

    const products = await this.prisma.product.findMany({
      where: {
        commerceId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        available: true,
      },
      take: 20,
    });

    return products.map((p) => this.formatProduct(p));
  }

  async getCommerceProductStats(commerceId: string): Promise<{
    totalProducts: number;
    availableProducts: number;
    unavailableProducts: number;
    averagePrice: number;
    categories: { name: string; count: number }[];
  }> {
    const products = await this.prisma.product.findMany({
      where: { commerceId },
    });

    const total = products.length;
    const available = products.filter((p) => p.available).length;
    const unavailable = total - available;
    const avgPrice = products.length > 0
      ? products.reduce((sum, p) => sum + Number(p.basePrice), 0) / products.length
      : 0;

    const categoryMap = new Map<string, number>();
    products.forEach((p) => {
      categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
    });

    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));

    return {
      totalProducts: total,
      availableProducts: available,
      unavailableProducts: unavailable,
      averagePrice: Math.round(avgPrice * 100) / 100,
      categories,
    };
  }

  private formatProduct(product: any): ProductResponseDto {
    return {
      id: product.id,
      commerceId: product.commerceId,
      name: product.name,
      description: product.description,
      basePrice: Number(product.basePrice),
      category: product.category,
      imageUrl: product.imageUrl,
      available: product.available,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
