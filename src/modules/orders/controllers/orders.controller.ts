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
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new order' })
  @ApiCreatedResponse({ type: OrderResponseDto, description: 'Order created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input or business rule violation' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token invalid or missing' })
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: any): Promise<OrderResponseDto> {
    const customerId = req.user?.id;
    if (!customerId) {
      throw new Error('Customer ID not found in JWT token');
    }
    return this.ordersService.createOrder(customerId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiOkResponse({ type: OrderResponseDto, description: 'Order details' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token invalid or missing' })
  async getOrder(@Param('id') orderId: string, @Req() req: any): Promise<OrderResponseDto> {
    const customerId = req.user?.id;
    return this.ordersService.getOrder(orderId, customerId);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order status' })
  @ApiOkResponse({ type: OrderResponseDto, description: 'Order status updated' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Invalid status transition' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateStatus(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateOrderStatus(orderId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders with pagination' })
  @ApiOkResponse({ type: [OrderResponseDto], description: 'List of orders' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async listOrders(
    @Req() req: any,
    @Query('customerId') customerId?: string,
    @Query('commerceId') commerceId?: string,
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
  ) {
    const limitNum = Math.min(parseInt(limit), 100);
    const offsetNum = parseInt(offset);

    // If listing customer orders, ensure it's the same customer
    if (customerId && req.user?.id && customerId !== req.user.id) {
      throw new Error('Unauthorized - can only list your own orders');
    }

    if (customerId || req.user?.id) {
      return this.ordersService.listCustomerOrders(customerId || req.user.id, limitNum, offsetNum);
    }

    if (commerceId) {
      return this.ordersService.listCommerceOrders(commerceId, limitNum, offsetNum);
    }

    return [];
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order' })
  @ApiOkResponse({ description: 'Order cancelled successfully' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Cannot cancel order in current status' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async cancelOrder(@Param('id') orderId: string, @Req() req: any): Promise<void> {
    const customerId = req.user?.id;
    if (!customerId) {
      throw new Error('Customer ID not found in JWT token');
    }
    await this.ordersService.cancelOrder(orderId, customerId);
  }
}
