import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CommercesService } from '../services/commerces.service';
import {
  CommerceProfileDto,
  CommerceResponseDto,
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
} from '../dto';

@ApiTags('Commerces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('commerces')
export class CommercesController {
  constructor(private readonly commercesService: CommercesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get commerce profile' })
  @ApiOkResponse({ type: CommerceResponseDto })
  async getProfile(@Param('id') commerceId: string): Promise<CommerceResponseDto> {
    return this.commercesService.getProfile(commerceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update commerce profile' })
  @ApiOkResponse({ type: CommerceResponseDto })
  async updateProfile(
    @Param('id') commerceId: string,
    @Body() dto: CommerceProfileDto,
  ): Promise<CommerceResponseDto> {
    return this.commercesService.updateProfile(commerceId, dto);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'List commerce products' })
  @ApiOkResponse({ type: [ProductResponseDto] })
  async listProducts(@Param('id') commerceId: string): Promise<ProductResponseDto[]> {
    return this.commercesService.listProducts(commerceId);
  }

  @Post(':id/products')
  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponse({ type: ProductResponseDto })
  async createProduct(
    @Param('id') commerceId: string,
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.commercesService.createProduct(commerceId, dto);
  }

  @Patch(':id/products/:productId')
  @ApiOperation({ summary: 'Update product' })
  @ApiOkResponse({ type: ProductResponseDto })
  async updateProduct(
    @Param('id') commerceId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.commercesService.updateProduct(commerceId, productId, dto);
  }

  @Delete(':id/products/:productId')
  @ApiOperation({ summary: 'Delete product' })
  async deleteProduct(
    @Param('id') commerceId: string,
    @Param('productId') productId: string,
  ): Promise<void> {
    return this.commercesService.deleteProduct(commerceId, productId);
  }
}
