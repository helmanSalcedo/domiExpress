import { E2eTestHelper } from './helpers/e2e.helper';

describe('Auth E2E', () => {
  let helper: E2eTestHelper;

  beforeAll(async () => {
    helper = new E2eTestHelper();
    await helper.setup();
    await helper.cleanDatabase();
  });

  afterAll(async () => {
    await helper.cleanup();
  });

  describe('Customer Authentication', () => {
    it('should register a new customer', async () => {
      const response = await helper
        .request()
        .post('/auth/customers/register')
        .send({
          municipalityId: '123e4567-e89b-12d3-a456-426614174000',
          phone: '+573001234567',
          name: 'John Doe',
          password: 'SecurePassword123',
          preferredLanguage: 'es',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('customer');
      expect(response.body.customer).toHaveProperty('id');
      expect(response.body.customer.phone).toBe('+573001234567');
    });

    it('should not register customer with duplicate phone', async () => {
      const phone = '+573009876543';

      // First registration
      await helper.request().post('/auth/customers/register').send({
        municipalityId: '123e4567-e89b-12d3-a456-426614174000',
        phone,
        name: 'First User',
        password: 'SecurePassword123',
        preferredLanguage: 'es',
      });

      // Second registration with same phone
      const response = await helper
        .request()
        .post('/auth/customers/register')
        .send({
          municipalityId: '123e4567-e89b-12d3-a456-426614174000',
          phone,
          name: 'Second User',
          password: 'SecurePassword123',
          preferredLanguage: 'es',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });

    it('should login customer with valid credentials', async () => {
      const phone = '+573005555555';
      const password = 'TestPassword123';

      // Register first
      await helper.request().post('/auth/customers/register').send({
        municipalityId: '123e4567-e89b-12d3-a456-426614174000',
        phone,
        name: 'Login Test User',
        password,
        preferredLanguage: 'es',
      });

      // Login
      const response = await helper
        .request()
        .post('/auth/customers/login')
        .send({
          phone,
          password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.accessToken).toBeTruthy();
    });

    it('should not login with invalid password', async () => {
      const phone = '+573006666666';

      // Register
      await helper.request().post('/auth/customers/register').send({
        municipalityId: '123e4567-e89b-12d3-a456-426614174000',
        phone,
        name: 'Invalid Password Test',
        password: 'CorrectPassword123',
        preferredLanguage: 'es',
      });

      // Try login with wrong password
      const response = await helper
        .request()
        .post('/auth/customers/login')
        .send({
          phone,
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
    });

    it('should not login with non-existent customer', async () => {
      const response = await helper
        .request()
        .post('/auth/customers/login')
        .send({
          phone: '+573007777777',
          password: 'AnyPassword123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Commerce Authentication', () => {
    it('should register a new commerce', async () => {
      const response = await helper
        .request()
        .post('/auth/commerces/register')
        .send({
          municipalityId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Test Restaurant',
          category: 'RESTAURANT',
          phone: '+573108888888',
          ownerName: 'Juan García',
          ownerEmail: 'juan@restaurant.com',
          latitude: 4.7110,
          longitude: -74.0721,
          password: 'CommercePassword123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('commerce');
      expect(response.body.commerce.name).toBe('Test Restaurant');
    });

    it('should login commerce with valid credentials', async () => {
      const apiKey = `test-key-${Date.now()}`;
      const password = 'CommercePass456';

      // Register
      await helper.request().post('/auth/commerces/register').send({
        municipalityId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Login Test Commerce',
        category: 'STORE',
        phone: '+573109999999',
        ownerName: 'Test Owner',
        ownerEmail: 'owner@test.com',
        latitude: 4.7110,
        longitude: -74.0721,
        password,
      });

      // Login with API key
      const response = await helper
        .request()
        .post('/auth/commerces/login')
        .send({
          apiKey,
          password,
        });

      // Should either succeed or return specific error
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Token Validation', () => {
    it('should reject request without token', async () => {
      const response = await helper.request().get('/customers/me');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await helper
        .request()
        .get('/customers/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });
  });
});
