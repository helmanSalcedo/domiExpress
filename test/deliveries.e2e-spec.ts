import { E2eTestHelper } from './helpers/e2e.helper';

describe('Deliveries E2E', () => {
  let helper: E2eTestHelper;
  let testData: any;
  let orderId: string;
  let deliveryId: string;

  beforeAll(async () => {
    helper = new E2eTestHelper();
    await helper.setup();
    await helper.cleanDatabase();

    testData = await helper.seedTestData();

    // Create an order for delivery testing
    const prisma = helper.getPrisma();
    const order = await prisma.order.create({
      data: {
        municipalityId: testData.municipalityId,
        customerId: testData.customerId,
        customerPhone: '+573001111111',
        customerLocationLatitude: 4.711,
        customerLocationLongitude: -74.0721,
        subtotal: 50000,
        totalAmount: 55000,
        status: 'CONFIRMED',
      },
    });

    orderId = order.id;

    // Create delivery for this order
    const delivery = await prisma.delivery.create({
      data: {
        orderId: order.id,
        driverId: testData.driverId,
        status: 'PENDING',
        pickupLocationLatitude: 4.7115,
        pickupLocationLongitude: -74.072,
        deliveryLocationLatitude: 4.711,
        deliveryLocationLongitude: -74.0721,
        distanceKm: 0.5,
        estimatedDurationMinutes: 15,
      },
    });

    deliveryId = delivery.id;
  });

  afterAll(async () => {
    await helper.cleanup();
  });

  describe('Get Delivery', () => {
    it('should retrieve delivery details', async () => {
      const response = await helper.request().get(`/deliveries/${deliveryId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(deliveryId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('orderId');
      expect(response.body).toHaveProperty('driverId');
    });

    it('should return 404 for non-existent delivery', async () => {
      const response = await helper.request().get('/deliveries/non-existent-id');

      expect(response.status).toBe(404);
    });
  });

  describe('Assign Delivery', () => {
    it('should assign driver to delivery', async () => {
      const response = await helper.request().patch(`/deliveries/${deliveryId}/assign`).send({
        driverId: testData.driverId,
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ASSIGNED');
      expect(response.body.driverId).toBe(testData.driverId);
    });

    it('should not assign inactive driver', async () => {
      // Create inactive driver
      const prisma = helper.getPrisma();
      const inactiveDriver = await prisma.driver.create({
        data: {
          municipalityId: testData.municipalityId,
          phone: '+573004444444',
          fullName: 'Inactive Driver',
          identificationNumber: '9876543210',
          identificationType: 'CC',
          vehicleType: 'CAR',
          isActive: false,
        },
      });

      // Try to assign
      const response = await helper.request().patch(`/deliveries/${deliveryId}/assign`).send({
        driverId: inactiveDriver.id,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('not active');
    });
  });

  describe('Update Delivery Location', () => {
    it('should update delivery location', async () => {
      const response = await helper.request().patch(`/deliveries/${deliveryId}/location`).send({
        latitude: 4.7112,
        longitude: -74.0719,
        accuracyMeters: 5,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deliveryLatitude');
      expect(response.body).toHaveProperty('deliveryLongitude');
    });

    it('should not update with invalid coordinates', async () => {
      const response = await helper.request().patch(`/deliveries/${deliveryId}/location`).send({
        latitude: 'invalid',
        longitude: -74.0719,
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Complete Delivery', () => {
    it('should complete delivery', async () => {
      // First assign
      await helper.request().patch(`/deliveries/${deliveryId}/assign`).send({
        driverId: testData.driverId,
      });

      // Update to in transit
      await helper.request().patch(`/deliveries/${deliveryId}/location`).send({
        latitude: 4.711,
        longitude: -74.0721,
      });

      // Complete
      const response = await helper.request().patch(`/deliveries/${deliveryId}/complete`).send({
        notes: 'Delivered successfully',
        rating: 5,
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('DELIVERED');
    });
  });

  describe('Delivery Statistics', () => {
    it('should get active deliveries', async () => {
      const response = await helper.request().get('/deliveries/active');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
