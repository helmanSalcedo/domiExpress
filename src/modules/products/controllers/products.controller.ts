import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ProductsService, CreateProductDto, UpdateProductDto, ProductResponseDto } from '../services/products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCreatedResponse({ description: 'Product created' })
  async createProduct(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.createProduct(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiOkResponse({ description: 'Success' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async getProduct(@Param('id') productId: string): Promise<ProductResponseDto> {
    return this.productsService.getProduct(productId);
  }

  @Get('commerce/:commerceId')
  @ApiOperation({ summary: 'Get all products for a commerce' })
  @ApiOkResponse({ description: 'List of products' })
  async getCommerceProducts(
    @Param('commerceId') commerceId: string,
    @Query('category') category?: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.getCommerceProducts(commerceId, category, limit, offset);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  @ApiOkResponse({ description: 'Success' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async updateProduct(
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.updateProduct(productId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async deleteProduct(@Param('id') productId: string): Promise<void> {
    return this.productsService.deleteProduct(productId);
  }

  @Put(':id/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle product availability' })
  @ApiOkResponse({ description: 'Success' })
  async toggleAvailability(
    @Param('id') productId: string,
    @Body() body: { available: boolean },
  ): Promise<ProductResponseDto> {
    return this.productsService.toggleAvailability(productId, body.available);
  }

  @Get('commerce/:commerceId/category/:category')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiOkResponse({ description: 'List of products' })
  async getProductsByCategory(
    @Param('commerceId') commerceId: string,
    @Param('category') category: string,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.getProductsByCategory(commerceId, category);
  }

  @Get('commerce/:commerceId/search')
  @ApiOperation({ summary: 'Search products' })
  @ApiOkResponse({ description: 'List of products' })
  async searchProducts(
    @Param('commerceId') commerceId: string,
    @Query('q') query: string,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.searchProducts(commerceId, query);
  }

  @Get('commerce/:commerceId/stats')
  @ApiOperation({ summary: 'Get product statistics' })
  async getProductStats(@Param('commerceId') commerceId: string) {
    return this.productsService.getCommerceProductStats(commerceId);
  }
}
