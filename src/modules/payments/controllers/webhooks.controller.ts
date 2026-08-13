import { Controller, Post, Body, Logger, BadRequestException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { PaymentsService } from '../services/payments.service';
import { DeliveriesService } from '@modules/deliveries/services/deliveries.service';
import { DriverAssignmentService } from '@modules/drivers/services/driver-assignment.service';
import { WompiClient } from '../wompi-client/wompi.client';
import { PaymentWebhookDto, PaymentStatus } from '../dto';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private paymentsService: PaymentsService,
    private deliveriesService: DeliveriesService,
    private driverAssignment: DriverAssignmentService,
    private wompiClient: WompiClient,
  ) {}

  @Post('wompi')
  @ApiOperation({ summary: 'Wompi payment webhook endpoint' })
  @ApiOkResponse({ description: 'Webhook processed successfully' })
  async handleWompiWebhook(@Body() dto: PaymentWebhookDto, @Req() req: any) {
    this.logger.log(`📨 Webhook Wompi received: ${dto.reference}, status: ${dto.status}`);

    // Validar firma del webhook
    const signature = req.headers['x-wompi-signature'] as string;
    const timestamp = req.headers['x-wompi-timestamp'] as string;
    const payload = JSON.stringify(req.body);

    if (!this.wompiClient.validateWebhookSignature(payload, signature, timestamp)) {
      this.logger.warn(`❌ Invalid webhook signature for: ${dto.reference}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    // Procesar pago
    const payment = await this.paymentsService.processWebhook(dto);
    this.logger.log(`✅ Payment ${payment.id} status updated to: ${payment.status}`);

    // Si pago aprobado, crear delivery automáticamente
    if (dto.status === PaymentStatus.APPROVED) {
      await this.handlePaymentApproved(payment);
    }

    // Si pago falló, notificar cliente
    if (dto.status === PaymentStatus.FAILED || dto.status === PaymentStatus.DECLINED) {
      await this.handlePaymentFailed(payment);
    }

    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
    };
  }

  private async handlePaymentApproved(payment: any) {
    this.logger.log(`🎯 Payment approved, creating delivery for order: ${payment.orderId}`);

    try {
      // Obtener orden con ubicaciones
      const order = await this.getOrderWithLocations(payment.orderId);

      if (!order) {
        this.logger.error(`❌ Order not found: ${payment.orderId}`);
        return;
      }

      // Crear delivery
      const delivery = await this.createDeliveryFromOrder(order);
      this.logger.log(`📦 Delivery created: ${delivery.id}`);

      // Asignar driver automáticamente (nearest-driver algorithm)
      const assignment = await this.driverAssignment.assignNearestDriver(
        delivery.id,
        order.pickupLocationLatitude,
        order.pickupLocationLongitude,
      );

      // Actualizar delivery con driver asignado
      await this.deliveriesService.assignDelivery(delivery.id, {
        driverId: assignment.driverId,
      });

      this.logger.log(
        `✅ Driver assigned: ${assignment.driverId}, distance: ${assignment.distanceKm}km`,
      );

      // Notificar driver (TODO: WhatsApp notification)
      // await this.notificationService.notifyDriverAssignment(assignment.driverId, delivery.id);

      // Registrar en earnings (TODO)
      // await this.driverEarningsService.recordEarning(delivery.id, assignment.driverId);
    } catch (error) {
      this.logger.error(
        `❌ Error handling payment approved: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private async handlePaymentFailed(payment: any) {
    this.logger.warn(
      `⚠️ Payment failed for order: ${payment.orderId}, updating order status`,
    );

    // Actualizar orden a FAILED (ya se hace en PaymentsService.processWebhook)
    // pero podríamos enviar notificación aquí (TODO)
  }

  private async getOrderWithLocations(orderId: string): Promise<any> {
    // Simular lectura de orden con ubicaciones
    // En producción, obtener de DB con Prisma
    return {
      id: orderId,
      pickupLocationLatitude: 4.7110,
      pickupLocationLongitude: -74.0721,
      deliveryLocationLatitude: 4.7100,
      deliveryLocationLongitude: -74.0730,
      customerMunicipalityId: 'mun-1',
      reference: `ORD-${orderId.slice(0, 8)}`,
    };
  }

  private async createDeliveryFromOrder(order: any): Promise<any> {
    // Crear delivery desde orden
    // En producción, usar DeliveriesService.createDelivery()
    return {
      id: `deliv-${Date.now()}`,
      orderId: order.id,
      status: 'PENDING',
      pickupLocationLatitude: order.pickupLocationLatitude,
      pickupLocationLongitude: order.pickupLocationLongitude,
      deliveryLocationLatitude: order.deliveryLocationLatitude,
      deliveryLocationLongitude: order.deliveryLocationLongitude,
    };
  }
}
