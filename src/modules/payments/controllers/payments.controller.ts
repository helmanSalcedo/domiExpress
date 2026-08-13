import { Controller, Post, Get, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PaymentsService } from '../services/payments.service';
import { GeneratePaymentLinkDto, PaymentWebhookDto, PaymentResponseDto, RefundRequestDto } from '../dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate payment link' })
  @ApiCreatedResponse({ type: Object })
  async generatePaymentLink(
    @Body() dto: GeneratePaymentLinkDto,
    @Query('customerId') customerId: string,
  ) {
    return this.paymentsService.generatePaymentLink(customerId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status' })
  @ApiOkResponse({ type: PaymentResponseDto })
  async getPayment(@Param('id') paymentId: string): Promise<PaymentResponseDto> {
    return this.paymentsService.getPayment(paymentId);
  }

  @Post('webhook/wompi')
  @ApiOperation({ summary: 'Wompi webhook endpoint' })
  async handleWompiWebhook(@Body() dto: PaymentWebhookDto): Promise<PaymentResponseDto> {
    return this.paymentsService.processWebhook(dto);
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request refund' })
  async requestRefund(
    @Body() dto: RefundRequestDto,
    @Query('customerId') customerId: string,
  ) {
    return this.paymentsService.requestRefund(customerId, dto);
  }
}
