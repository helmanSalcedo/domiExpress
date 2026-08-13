# E2E Testing Guide

## Overview

End-to-End (E2E) tests validate complete workflows across the entire application, from API requests to database operations to external service integrations.

## Test Structure

```
test/
├── jest-e2e.json              # Jest config for E2E tests
├── setup.ts                   # Database setup/teardown
├── helpers/
│   └── e2e.helper.ts         # Test utilities
├── auth.e2e-spec.ts          # Authentication flows
├── orders.e2e-spec.ts        # Order workflows
├── deliveries.e2e-spec.ts    # Delivery operations
└── redis-queue.e2e-spec.ts   # Cache & queue integration
```

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run E2E tests in watch mode
```bash
npm run test:e2e:watch
```

### Run all tests (unit + E2E)
```bash
npm run test:all
```

### Run specific test file
```bash
npm run test:e2e -- auth.e2e-spec.ts
```

### Run tests matching pattern
```bash
npm run test:e2e -- --testNamePattern="should create order"
```

## Setup Requirements

### Database
E2E tests use a separate test database:
- **Host**: localhost
- **Port**: 5433
- **Database**: domiexpress_test
- **User**: domiexpress
- **Password**: domiexpress_test_pass

**Note**: Ensure PostgreSQL test container is running:
```bash
docker-compose ps
# Should show domiexpress_postgres_test running on port 5433
```

### Redis
Tests also use separate test Redis instance:
- **Port**: 6380
- Used for cache and session testing

**Verify Redis test instance is running**:
```bash
docker-compose exec redis_test redis-cli ping
```

## Test Files

### auth.e2e-spec.ts
Tests authentication workflows:
- ✅ Customer registration
- ✅ Commerce registration
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Token validation
- ✅ Duplicate phone prevention

**Run**: `npm run test:e2e -- auth.e2e-spec.ts`

### orders.e2e-spec.ts
Tests order creation and management:
- ✅ Create order
- ✅ Validate order items
- ✅ Get order details
- ✅ Order workflow (PENDING → CONFIRMED)
- ✅ Error handling

**Run**: `npm run test:e2e -- orders.e2e-spec.ts`

### deliveries.e2e-spec.ts
Tests delivery operations:
- ✅ Get delivery details
- ✅ Assign driver
- ✅ Update location
- ✅ Complete delivery
- ✅ Delivery statistics

**Run**: `npm run test:e2e -- deliveries.e2e-spec.ts`

### redis-queue.e2e-spec.ts
Tests Redis and queue integration:
- ✅ Cache operations
- ✅ Geospatial queries
- ✅ Session management
- ✅ Rate limiting
- ✅ Pub/Sub messaging
- ✅ Atomic operations

**Run**: `npm run test:e2e -- redis-queue.e2e-spec.ts`

## Test Utilities

### E2eTestHelper

```typescript
import { E2eTestHelper } from './helpers/e2e.helper';

let helper: E2eTestHelper;

beforeAll(async () => {
  helper = new E2eTestHelper();
  await helper.setup();
});

// Make HTTP request
await helper.request()
  .post('/auth/customers/register')
  .send(data);

// Make authenticated request
await helper.request()
  .post('/orders')
  .set('Authorization', `Bearer ${token}`)
  .send(data);

// Access database directly
const prisma = helper.getPrisma();
const user = await prisma.customer.findUnique({
  where: { id: customerId }
});

// Seed test data
const testData = await helper.seedTestData();

// Clean database
await helper.cleanDatabase();
```

## Writing New Tests

### Basic Template

```typescript
import { E2eTestHelper } from './helpers/e2e.helper';

describe('Feature E2E', () => {
  let helper: E2eTestHelper;
  let token: string;

  beforeAll(async () => {
    helper = new E2eTestHelper();
    await helper.setup();
    await helper.cleanDatabase();
    
    // Setup test data and auth
    const testData = await helper.seedTestData();
    const loginRes = await helper.request()
      .post('/auth/customers/login')
      .send({ phone, password });
    token = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await helper.cleanup();
  });

  it('should perform action', async () => {
    const response = await helper.request()
      .post('/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should handle errors', async () => {
    const response = await helper.request()
      .post('/endpoint')
      .send(invalidPayload);

    expect(response.status).toBe(400);
  });
});
```

## Best Practices

### 1. Isolation
Each test should be independent:
```typescript
beforeEach(async () => {
  await helper.cleanDatabase(); // Fresh state for each test
});
```

### 2. Meaningful Assertions
```typescript
// ✅ Good
expect(response.body).toHaveProperty('id');
expect(response.body.status).toBe('PENDING');

// ❌ Avoid
expect(response.status).toBe(201); // Only this
```

### 3. Test Complete Workflows
```typescript
// ✅ Test the full flow
it('should complete order workflow', async () => {
  // 1. Create
  // 2. Confirm
  // 3. Verify status
});
```

### 4. Use Descriptive Names
```typescript
// ✅ Good
it('should not create order with invalid items', async () => {

// ❌ Avoid
it('should error', async () => {
```

### 5. Database Queries
```typescript
// Verify database state after API call
const prisma = helper.getPrisma();
const order = await prisma.order.findUnique({
  where: { id: orderId }
});
expect(order.status).toBe('CONFIRMED');
```

## Debugging Tests

### Verbose Output
```bash
npm run test:e2e -- --verbose
```

### Debug Single Test
```bash
node --inspect-brk node_modules/.bin/jest --config test/jest-e2e.json auth.e2e-spec.ts
```

### Print Statements
```typescript
console.log('Response:', response.body);
console.log('Database state:', dbResult);
```

### Check Database Directly
```bash
# Connect to test database
docker-compose exec postgres_test psql -U domiexpress -d domiexpress_test

# View tables
\dt
SELECT * FROM "Order" LIMIT 10;
```

## Troubleshooting

### "Cannot connect to database"
```bash
# Ensure test containers are running
docker-compose ps

# If not, start them
docker-compose up -d postgres_test redis_test
```

### "Address already in use"
```bash
# Check what's using the port
lsof -i :5433

# Kill process and restart container
docker-compose restart postgres_test
```

### Tests timeout
- Increase timeout in jest-e2e.json: `"testTimeout": 60000`
- Check database performance
- Reduce parallel test execution

### Database not cleaning up
```bash
# Manual cleanup
docker-compose exec postgres_test psql -U domiexpress -d domiexpress_test -c "TRUNCATE TABLE \"Order\" CASCADE;"
```

## CI/CD Integration

Tests run automatically in CI pipeline:
```yaml
# .github/workflows/ci.yml
- name: Run E2E tests
  run: npm run test:e2e
```

## Performance Tips

1. **Parallel execution**: Tests run serially (`--runInBand`) to avoid database conflicts
2. **Seed data reuse**: Create once per suite, not per test
3. **Mock external APIs**: Don't call real Wompi/WhatsApp in tests
4. **Use indexes**: Ensure test database has proper indexes

## Coverage

Current E2E tests cover:
- ✅ Authentication (customer & commerce)
- ✅ Order creation and workflow
- ✅ Delivery operations
- ✅ Redis caching
- ✅ Rate limiting
- ✅ Error handling

**Recommended additions**:
- [ ] Payment flow
- [ ] Driver operations
- [ ] Search functionality
- [ ] Ratings & disputes
- [ ] Analytics
