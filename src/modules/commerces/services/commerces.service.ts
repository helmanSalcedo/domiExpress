import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import {
  CommerceProfileDto,
  CommerceResponseDto,
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
} from '../dto';

@Injectable()
export class CommercesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(commerceId: string): Promise<CommerceResponseDto> {
    const commerce = await this.prisma.commerce.findUnique({
      where: { id: commerceId },
    });

    if (!commerce) {
      throw new NotFoundException('Commerce not found');
    }

    return {
      id: commerce.id,
      name: commerce.name,
      whatsappNumber: commerce.whatsappNumber,
      ownerEmail: commerce.ownerEmail,
      rating: Number(commerce.rating),
      totalOrders: commerce.totalOrders,
      isActive: commerce.isActive,
      apiKey: commerce.apiKey,
      createdAt: commerce.createdAt,
      updatedAt: commerce.updatedAt,
    };
  }

  async updateProfile(commerceId: string, dto: CommerceProfileDto): Promise<CommerceResponseDto> {
    const commerce = await this.prisma.commerce.findUnique({
      where: { id: commerceId },
    });

    if (!commerce) {
      throw new NotFoundException('Commerce not found');
    }

    const updated = await this.prisma.commerce.update({
      where: { id: commerceId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.heroImageUrl && { heroImageUrl: dto.heroImageUrl }),
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      whatsappNumber: updated.whatsappNumber,
      ownerEmail: updated.ownerEmail,
      rating: Number(updated.rating),
      totalOrders: updated.totalOrders,
      isActive: updated.isActive,
      apiKey: updated.apiKey,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async createProduct(commerceId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
    const commerce = await this.prisma.commerce.findUnique({
      where: { id: commerceId },
    });

    if (!commerce) {
      throw new NotFoundException('Commerce not found');
    }

    const product = await this.prisma.product.create({
      data: {
        commerceId,
        name: dto.name,
        description: dto.description,
        basePrice: dto.basePrice,
        sku: dto.sku,
        imageUrl: dto.imageUrl,
        preparationTimeMinutes: dto.preparationTimeMinutes || 0,
        isVegan: dto.isVegan || false,
        isVegetarian: dto.isVegetarian || false,
        isSpicy: dto.isSpicy || false,
      },
    });

    return {
      id: product.id,
      commerceId: product.commerceId,
      name: product.name,
      description: product.description || undefined,
      basePrice: Number(product.basePrice),
      sku: product.sku || undefined,
      imageUrl: product.imageUrl || undefined,
      stockStatus: product.stockStatus,
      rating: Number(product.rating),
      isVegan: product.isVegan,
      isVegetarian: product.isVegetarian,
      isSpicy: product.isSpicy,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async updateProduct(
    commerceId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.commerceId !== commerceId) {
      throw new NotFoundException('Product not found');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.basePrice && { basePrice: dto.basePrice }),
        ...(dto.imageUrl && { imageUrl: dto.imageUrl }),
        ...(dto.stockStatus && { stockStatus: dto.stockStatus }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
      },
    });

    return {
      id: updated.id,
      commerceId: updated.commerceId,
      name: updated.name,
      description: updated.description || undefined,
      basePrice: Number(updated.basePrice),
      sku: updated.sku || undefined,
      imageUrl: updated.imageUrl || undefined,
      stockStatus: updated.stockStatus,
      rating: Number(updated.rating),
      isVegan: updated.isVegan,
      isVegetarian: updated.isVegetarian,
      isSpicy: updated.isSpicy,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async listProducts(commerceId: string): Promise<ProductResponseDto[]> {
    const commerce = await this.prisma.commerce.findUnique({
      where: { id: commerceId },
    });

    if (!commerce) {
      throw new NotFoundException('Commerce not found');
    }

    const products = await this.prisma.product.findMany({
      where: { commerceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p: any) => ({
      id: p.id,
      commerceId: p.commerceId,
      name: p.name,
      description: p.description || undefined,
      basePrice: Number(p.basePrice),
      sku: p.sku || undefined,
      imageUrl: p.imageUrl || undefined,
      stockStatus: p.stockStatus,
      rating: Number(p.rating),
      isVegan: p.isVegan,
      isVegetarian: p.isVegetarian,
      isSpicy: p.isSpicy,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async deleteProduct(commerceId: string, productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.commerceId !== commerceId) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });
  }
}
