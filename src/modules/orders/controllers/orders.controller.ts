import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderResponseDto } from '../dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  async createOrder(@Body() dto: CreateOrderDto, @Query('customerId') customerId: string): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(customerId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiOkResponse({ type: OrderResponseDto })
  async getOrder(
    @Param('id') orderId: string,
    @Query('customerId') customerId?: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.getOrder(orderId, customerId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiOkResponse({ type: OrderResponseDto })
  async updateStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateOrderStatus(orderId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders' })
  @ApiOkResponse({ type: [OrderResponseDto] })
  async listOrders(
    @Query('customerId') customerId?: string,
    @Query('commerceId') commerceId?: string,
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    const limitNum = Math.min(parseInt(limit), 100);
    const offsetNum = parseInt(offset);

    if (customerId) {
      return this.ordersService.listCustomerOrders(customerId, limitNum, offsetNum);
    }

    if (commerceId) {
      return this.ordersService.listCommerceOrders(commerceId, limitNum, offsetNum);
    }

    return [];
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(
    @Param('id') orderId: string,
    @Query('customerId') customerId: string,
  ): Promise<void> {
    await this.ordersService.cancelOrder(orderId, customerId);
  }
}
