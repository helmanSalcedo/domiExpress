import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';

export interface CreateProductDto {
  commerceId: string;
  name: string;
  description?: string;
  basePrice: number;
  categoryId?: string;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  basePrice?: number;
  categoryId?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ProductResponseDto {
  id: string;
  commerceId: string;
  name: string;
  description?: string;
  basePrice: number;
  categoryId?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    this.logger.log(`📦 Creating product: ${dto.name}`);

    if (dto.basePrice < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    if (!dto.name || dto.name.length === 0) {
      throw new BadRequestException('Product name is required');
    }

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
        categoryId: dto.categoryId,
        imageUrl: dto.imageUrl,
        isActive: true,
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
    categoryId?: string,
    limit = 50,
    offset = 0,
  ): Promise<ProductResponseDto[]> {
    this.logger.debug(`Fetching products for commerce: ${commerceId}`);

    const where: any = { commerceId, isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await this.prisma.product.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return products.map(p => this.formatProduct(p));
  }

  async updateProduct(productId: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    this.logger.log(`📝 Updating product: ${productId}`);

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
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.basePrice && { basePrice: dto.basePrice }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.imageUrl && { imageUrl: dto.imageUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
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

    await this.prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    this.logger.log(`✅ Product soft deleted: ${productId}`);
  }

  async toggleAvailability(productId: string, isActive: boolean): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { isActive },
    });

    this.logger.log(`✅ Product ${isActive ? 'activated' : 'deactivated'}: ${productId}`);
    return this.formatProduct(updated);
  }

  async getProductsByCategory(
    commerceId: string,
    categoryId: string,
  ): Promise<ProductResponseDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        commerceId,
        categoryId,
        isActive: true,
      },
      orderBy: { basePrice: 'asc' },
    });

    return products.map(p => this.formatProduct(p));
  }

  async searchProducts(commerceId: string, query: string): Promise<ProductResponseDto[]> {
    this.logger.debug(`Searching products: ${query}`);

    const products = await this.prisma.product.findMany({
      where: {
        commerceId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });

    return products.map(p => this.formatProduct(p));
  }

  async getCommerceProductStats(commerceId: string) {
    const products = await this.prisma.product.findMany({
      where: { commerceId },
    });

    const total = products.length;
    const active = products.filter((p: any) => p.isActive).length;
    const inactive = total - active;
    const avgPrice =
      products.length > 0
        ? products.reduce((sum: number, p: any) => sum + Number(p.basePrice), 0) / products.length
        : 0;

    return {
      totalProducts: total,
      activeProducts: active,
      inactiveProducts: inactive,
      averagePrice: Math.round(avgPrice * 100) / 100,
    };
  }

  private formatProduct(product: any): ProductResponseDto {
    return {
      id: product.id,
      commerceId: product.commerceId,
      name: product.name,
      description: product.description,
      basePrice: Number(product.basePrice),
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
