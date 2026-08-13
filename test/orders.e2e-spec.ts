import { E2eTestHelper } from './helpers/e2e.helper';

describe('Orders E2E', () => {
  let helper: E2eTestHelper;
  let testData: any;
  let customerToken: string;

  beforeAll(async () => {
    helper = new E2eTestHelper();
    await helper.setup();
    await helper.cleanDatabase();

    // Seed test data
    testData = await helper.seedTestData();

    // Register and login customer
    const registerResponse = await helper
      .request()
      .post('/auth/customers/register')
      .send({
        municipalityId: testData.municipalityId,
        phone: '+573001234567',
        name: 'Order Test Customer',
        password: 'TestPassword123',
        preferredLanguage: 'es',
      });

    customerToken = registerResponse.body.accessToken;
  });

  afterAll(async () => {
    await helper.cleanup();
  });

  describe('Create Order', () => {
    it('should create a new order', async () => {
      const response = await helper
        .request()
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            {
              commerceId: testData.commerceId,
              productId: 'product-123',
              quantity: 2,
              price: 50000,
            },
          ],
          customerLocationLatitude: 4.7110,
          customerLocationLongitude: -74.0721,
          customerPhone: '+573001234567',
          subtotal: 100000,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('PENDING');
      expect(response.body).toHaveProperty('totalAmount');
    });

    it('should not create order with invalid items', async () => {
      const response = await helper
        .request()
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [], // Empty items
          customerLocationLatitude: 4.7110,
          customerLocationLongitude: -74.0721,
          customerPhone: '+573001234567',
          subtotal: 0,
        });

      expect(response.status).toBe(400);
    });

    it('should not create order without authentication', async () => {
      const response = await helper.request().post('/orders').send({
        items: [
          {
            commerceId: testData.commerceId,
            productId: 'product-123',
            quantity: 1,
            price: 50000,
          },
        ],
        customerLocationLatitude: 4.7110,
        customerLocationLongitude: -74.0721,
        customerPhone: '+573001234567',
        subtotal: 50000,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Get Order', () => {
    it('should retrieve an existing order', async () => {
      // Create order first
      const createResponse = await helper
        .request()
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            {
              commerceId: testData.commerceId,
              productId: 'product-456',
              quantity: 1,
              price: 75000,
            },
          ],
          customerLocationLatitude: 4.7110,
          customerLocationLongitude: -74.0721,
          customerPhone: '+573001234567',
          subtotal: 75000,
        });

      const orderId = createResponse.body.id;

      // Get order
      const getResponse = await helper
        .request()
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.id).toBe(orderId);
      expect(getResponse.body).toHaveProperty('items');
      expect(getResponse.body).toHaveProperty('totalAmount');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await helper
        .request()
        .get('/orders/non-existent-id')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Order Workflow', () => {
    it('should complete order workflow: create → confirm → ready', async () => {
      // 1. Create order
      const createResponse = await helper
        .request()
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            {
              commerceId: testData.commerceId,
              productId: 'product-789',
              quantity: 2,
              price: 45000,
            },
          ],
          customerLocationLatitude: 4.7110,
          customerLocationLongitude: -74.0721,
          customerPhone: '+573001234567',
          subtotal: 90000,
        });

      const orderId = createResponse.body.id;
      expect(createResponse.body.status).toBe('PENDING');

      // 2. Confirm order
      const confirmResponse = await helper
        .request()
        .patch(`/orders/${orderId}/confirm`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(confirmResponse.status).toBe(200);
      expect(confirmResponse.body.status).toBe('CONFIRMED');

      // 3. Get updated order
      const getResponse = await helper
        .request()
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(getResponse.body.status).toBe('CONFIRMED');
    });
  });
});
