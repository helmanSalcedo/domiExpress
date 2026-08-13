import {
  Controller,
  Post,
  Get,
  Body,
  Param,
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
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PaymentsService } from '../services/payments.service';
import {
  GeneratePaymentLinkDto,
  PaymentWebhookDto,
  PaymentResponseDto,
  RefundRequestDto,
} from '../dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('link')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate payment link for an order' })
  @ApiCreatedResponse({ description: 'Payment link generated successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  @ApiBadRequestResponse({ description: 'Order not found or invalid' })
  async generatePaymentLink(@Body() dto: GeneratePaymentLinkDto, @Req() req: any) {
    const customerId = req.user?.id;
    if (!customerId) throw new Error('Unauthorized');
    return this.paymentsService.generatePaymentLink(customerId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment status by ID' })
  @ApiOkResponse({ type: PaymentResponseDto, description: 'Payment details' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async getPayment(@Param('id') paymentId: string): Promise<PaymentResponseDto> {
    return this.paymentsService.getPayment(paymentId);
  }

  @Post('webhook/wompi')
  @UseGuards() // No JWT required for webhook (Wompi signature validation instead)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Wompi webhook endpoint for payment notifications' })
  @ApiOkResponse({ description: 'Webhook processed successfully' })
  async handleWompiWebhook(@Body() dto: PaymentWebhookDto): Promise<PaymentResponseDto> {
    return this.paymentsService.processWebhook(dto);
  }

  @Post('refund')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request payment refund' })
  @ApiCreatedResponse({ description: 'Refund request created' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  @ApiBadRequestResponse({ description: 'Only approved payments can be refunded' })
  async requestRefund(@Body() dto: RefundRequestDto, @Req() req: any) {
    const customerId = req.user?.id;
    if (!customerId) throw new Error('Unauthorized');
    return this.paymentsService.requestRefund(customerId, dto);
  }
}
