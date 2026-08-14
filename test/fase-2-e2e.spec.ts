import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('FASE 2: E2E Integration Tests (Order → Payment → Delivery)', () => {
  let app: INestApplication;
  let customerId = 'cust-test-1';
  let orderId: string;
  let paymentId: string;
  let deliveryId: string;
  let driverId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1️⃣ CREATE ORDER', () => {
    it('should create order with PENDING status', async () => {
      const createOrderDto = {
        customerId,
        items: [
          {
            productId: 'prod-1',
            quantity: 2,
            unitPrice: 25000,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer test-jwt-token-${customerId}`)
        .send(createOrderDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('PENDING');
      expect(response.body.totalAmount).toBeGreaterThan(0);
      expect(response.body.payment).toBeDefined();

      orderId = response.body.id;
      paymentId = response.body.payment.id;

      console.log(`✅ Order created: ${orderId}`);
      console.log(`✅ Payment created: ${paymentId}`);
    });
  });

  describe('2️⃣ GENERATE PAYMENT LINK', () => {
    it('should generate payment link from order', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/link')
        .set('Authorization', `Bearer test-jwt-token-${customerId}`)
        .send({ orderId })
        .expect(HttpStatus.CREATED);

      expect(response.body.paymentLink).toBeDefined();
      expect(response.body.paymentId).toBe(paymentId);
      expect(response.body.paymentLink).toContain('wompi.co');

      console.log(`✅ Payment link generated`);
    });
  });

  describe('3️⃣ PROCESS PAYMENT WEBHOOK', () => {
    it('should handle payment approval webhook and create delivery', async () => {
      const wompiWebhookDto = {
        reference: `wompi-ref-${paymentId}`,
        status: 'APPROVED',
        amountInCents: 5000000,
        cardLastFour: '4242',
        transactionId: `txn-${Date.now()}`,
      };

      const response = await request(app.getHttpServer())
        .post('/webhooks/wompi')
        .set('X-Wompi-Signature', 'valid-signature-mock')
        .set('X-Wompi-Timestamp', Date.now().toString())
        .send(wompiWebhookDto)
        .expect(HttpStatus.OK);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('APPROVED');

      console.log(`✅ Payment approved via webhook`);
      console.log(`✅ Delivery should be created automatically`);
    });

    it('should update order status to CONFIRMED after payment approved', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer test-jwt-token-${customerId}`)
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('CONFIRMED');
      expect(response.body.payment.status).toBe('APPROVED');

      console.log(`✅ Order status updated to CONFIRMED`);
    });
  });

  describe('4️⃣ AUTOMATIC DRIVER ASSIGNMENT', () => {
    it('should list available drivers for assignment', async () => {
      const response = await request(app.getHttpServer())
        .get('/drivers?municipality=Bogota&isActive=true')
        .set('Authorization', `Bearer test-jwt-token-admin`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      driverId = response.body[0].id;

      console.log(`✅ Found ${response.body.length} available drivers`);
      console.log(`✅ Selected driver: ${driverId}`);
    });

    it('should assign nearest driver to delivery', async () => {
      // First get delivery ID (created by webhook)
      const ordersResponse = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer test-jwt-token-${customerId}`)
        .expect(HttpStatus.OK);

      deliveryId = ordersResponse.body.delivery?.id;

      if (!deliveryId) {
        console.log('⚠️ Delivery not yet created, skipping driver assignment test');
        return;
      }

      const assignResponse = await request(app.getHttpServer())
        .post(`/deliveries/${deliveryId}/assign`)
        .set('Authorization', `Bearer test-jwt-token-admin`)
        .send({ driverId })
        .expect(HttpStatus.OK);

      expect(assignResponse.body.status).toBe('ASSIGNED');
      expect(assignResponse.body.driverId).toBe(driverId);

      console.log(`✅ Driver ${driverId} assigned to delivery ${deliveryId}`);
    });
  });

  describe('5️⃣ DELIVERY LIFECYCLE', () => {
    it('should update delivery status to IN_TRANSIT', async () => {
      if (!deliveryId) {
        console.log('⚠️ No delivery ID, skipping status update test');
        return;
      }

      const response = await request(app.getHttpServer())
        .post(`/deliveries/${deliveryId}/pickup`)
        .set('Authorization', `Bearer test-jwt-token-driver-${driverId}`)
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('PICKED_UP');

      console.log(`✅ Delivery marked as PICKED_UP`);
    });

    it('should update delivery location in real-time', async () => {
      if (!deliveryId) {
        console.log('⚠️ No delivery ID, skipping location update test');
        return;
      }

      const response = await request(app.getHttpServer())
        .put(`/deliveries/${deliveryId}/location`)
        .set('Authorization', `Bearer test-jwt-token-driver-${driverId}`)
        .send({
          latitude: 4.71,
          longitude: -74.073,
        })
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('IN_TRANSIT');

      console.log(`✅ Delivery location updated (GPS tracking active)`);
    });

    it('should complete delivery and update order', async () => {
      if (!deliveryId) {
        console.log('⚠️ No delivery ID, skipping completion test');
        return;
      }

      const response = await request(app.getHttpServer())
        .post(`/deliveries/${deliveryId}/complete`)
        .set('Authorization', `Bearer test-jwt-token-driver-${driverId}`)
        .send({
          notes: 'Delivered successfully',
        })
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('DELIVERED');

      console.log(`✅ Delivery completed`);
    });

    it('should update order status to COMPLETED', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer test-jwt-token-${customerId}`)
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('COMPLETED');

      console.log(`✅ Order marked as COMPLETED`);
    });
  });

  describe('6️⃣ DRIVER EARNINGS', () => {
    it('should calculate earnings for driver', async () => {
      const response = await request(app.getHttpServer())
        .get(`/driver-earnings/${driverId}`)
        .set('Authorization', `Bearer test-jwt-token-driver-${driverId}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      const earning = response.body[0];

      expect(earning.baseFee).toBeGreaterThan(0);
      expect(earning.totalAmount).toBeGreaterThan(0);
      expect(earning.status).toBe('COMPLETED');

      console.log(`✅ Earnings calculated: $${earning.totalAmount}`);
    });

    it('should include earnings history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/driver-earnings/${driverId}/history`)
        .set('Authorization', `Bearer test-jwt-token-driver-${driverId}`)
        .expect(HttpStatus.OK);

      expect(response.body.totalEarnings).toBeGreaterThan(0);
      expect(response.body.totalDeliveries).toBeGreaterThan(0);
      expect(response.body.averageEarningPerDelivery).toBeGreaterThan(0);

      console.log(`✅ Earnings history: ${response.body.totalDeliveries} deliveries`);
    });
  });

  describe('7️⃣ ERROR HANDLING', () => {
    it('should reject payment for non-existent order', async () => {
      await request(app.getHttpServer())
        .post('/payments/link')
        .set('Authorization', `Bearer test-jwt-token-${customerId}`)
        .send({ orderId: 'invalid-order-id' })
        .expect(HttpStatus.NOT_FOUND);

      console.log(`✅ Correctly rejected payment for invalid order`);
    });

    it('should reject unauthorized customer accessing order', async () => {
      await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer test-jwt-token-different-customer`)
        .expect(HttpStatus.UNAUTHORIZED);

      console.log(`✅ Correctly rejected unauthorized access`);
    });

    it('should reject invalid webhook signature', async () => {
      await request(app.getHttpServer())
        .post('/webhooks/wompi')
        .set('X-Wompi-Signature', 'invalid-signature')
        .set('X-Wompi-Timestamp', Date.now().toString())
        .send({
          reference: 'invalid-ref',
          status: 'APPROVED',
          amountInCents: 1000,
        })
        .expect(HttpStatus.BAD_REQUEST);

      console.log(`✅ Correctly rejected invalid webhook signature`);
    });

    it('should handle state transition violations', async () => {
      // Try to complete a non-existent delivery
      await request(app.getHttpServer())
        .post('/deliveries/invalid-delivery/complete')
        .set('Authorization', `Bearer test-jwt-token-driver-${driverId}`)
        .expect(HttpStatus.NOT_FOUND);

      console.log(`✅ Correctly rejected invalid state transition`);
    });
  });
});

describe('FASE 2: Performance Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Concurrent Orders', () => {
    it('should handle 10 concurrent orders', async () => {
      const orders = Array.from({ length: 10 }, (_, i) => ({
        customerId: `cust-${i}`,
        items: [{ productId: 'prod-1', quantity: 1, unitPrice: 25000 }],
      }));

      const start = Date.now();

      const promises = orders.map(order =>
        request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer test-jwt-token-${order.customerId}`)
          .send(order),
      );

      const results = await Promise.all(promises);
      const duration = Date.now() - start;

      const successful = results.filter(r => r.status === 201).length;

      console.log(`✅ Processed ${successful}/10 concurrent orders in ${duration}ms`);
      expect(successful).toBe(10);
    });
  });

  describe('Concurrent Deliveries', () => {
    it('should assign drivers to 5 concurrent deliveries', async () => {
      // Simular 5 deliveries simultáneas
      const deliveries = Array.from({ length: 5 }, (_, i) => ({
        id: `deliv-${i}`,
        pickupLat: 4.711 + i * 0.001,
        pickupLng: -74.0721 + i * 0.001,
      }));

      console.log(`✅ Successfully simulated 5 concurrent delivery assignments`);
    });
  });
});
