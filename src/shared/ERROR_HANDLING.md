# Error Handling Strategy

## Global Exception Filters

All unhandled exceptions are caught by global filters:

### HttpExceptionFilter
- Catches all `HttpException` instances
- Formats error response with trace ID
- Logs errors based on status code
- Adds X-Trace-ID header to response

### AllExceptionsFilter  
- Catches all other exceptions
- Returns 500 Internal Server Error
- Logs full stack trace
- Provides trace ID for debugging

## Custom Exceptions

### Common Exceptions

```typescript
import {
  ValidationException,
  DuplicateException,
  ResourceNotFoundException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  RateLimitedException,
  PaymentException,
  InvalidStateException,
} from '@shared/exceptions';

// Validation error
throw new ValidationException('Invalid input', {
  email: ['Invalid email format'],
  phone: ['Phone number is required'],
});

// Resource not found
throw new ResourceNotFoundException('Order', orderId);

// Duplicate resource
throw new DuplicateException('Customer with this phone already exists');

// Unauthorized
throw new UnauthorizedException('Invalid credentials');

// Forbidden
throw new ForbiddenException('You do not have permission to access this resource');

// Rate limited
throw new RateLimitedException(resetDate);

// Payment error
throw new PaymentException('Payment processing failed', 'PAYMENT_DECLINED', {
  processor: 'Wompi',
  code: 'insufficient_funds',
});

// Invalid state transition
throw new InvalidStateException('Order', 'PENDING', 'COMPLETED');
```

## Error Response Format

```json
{
  "statusCode": 400,
  "timestamp": "2026-08-06T20:00:00.000Z",
  "path": "/api/orders",
  "method": "POST",
  "message": "Invalid input",
  "error": "ValidationError",
  "errors": {
    "email": ["Invalid email format"]
  },
  "traceId": "1723075200000-abc123def"
}
```

## Logging

Request logging is handled by `LoggingInterceptor`:

- **5xx errors**: Logged as ERROR
- **4xx errors**: Logged as WARN
- **2xx success**: Logged as LOG
- All requests include trace ID for tracking

### Log format
```
[traceId] METHOD /path - STATUS (duration ms)
```

## Usage Examples

### Service Layer

```typescript
import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from '@shared/exceptions';

@Injectable()
export class OrdersService {
  async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new ResourceNotFoundException('Order', orderId);
    }

    return order;
  }

  async createOrder(dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new ValidationException('Order must have at least one item');
    }

    // ... create order
  }
}
```

### Controller Layer

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ForbiddenException } from '@shared/exceptions';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() dto: CreateOrderDto, @Request() req: any) {
    // Authorization check
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Verify access
    if (req.user.municipalityId !== dto.municipalityId) {
      throw new ForbiddenException('Cannot create order in different municipality');
    }

    return this.ordersService.createOrder(dto);
  }
}
```

## Trace ID Tracking

Every request gets a unique trace ID for tracking:

```
X-Trace-ID: 1723075200000-abc123def
```

Use this ID to:
- Correlate logs across services
- Debug specific requests
- Track request flow through the system

### Retrieve trace ID from response headers
```typescript
const response = await fetch('/api/orders', { method: 'POST' });
const traceId = response.headers.get('X-Trace-ID');
console.log(`Request tracked as: ${traceId}`);
```

## HTTP Status Codes

Standard HTTP status codes used:

| Code | Name | Use Case |
|------|------|----------|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate or invalid state |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected error |

## Error Handling Best Practices

### 1. Be Specific
```typescript
// ✅ Good
throw new ResourceNotFoundException('Order', orderId);

// ❌ Avoid
throw new BadRequestException('Error');
```

### 2. Include Context
```typescript
// ✅ Good
throw new InvalidStateException('Order', 'PENDING', 'COMPLETED');

// ❌ Avoid
throw new BadRequestException('Invalid transition');
```

### 3. Don't Expose Internal Details
```typescript
// ✅ Good
throw new UnauthorizedException('Invalid credentials');

// ❌ Avoid
throw new UnauthorizedException('Database user lookup failed');
```

### 4. Validate Early
```typescript
// ✅ Good - Validate at controller boundary
@Post()
createOrder(@Body() dto: CreateOrderDto) {
  // class-validator handles validation
}

// ❌ Avoid - Letting bad data flow deep
```

### 5. Log Appropriately
```typescript
// ✅ Good - Log actual errors
catch (error) {
  this.logger.error('Payment processing failed', error);
  throw new PaymentException('Payment failed');
}

// ❌ Avoid - Logging expected validation
catch (error) {
  this.logger.error('User provided invalid email');
}
```

## Integration with Rate Limiting

```typescript
import { RateLimitService } from '@shared/redis';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(private rateLimits: RateLimitService) {}

  async intercept(context: ExecutionContext, next: any) {
    const request = context.switchToHttp().getRequest();
    const clientId = request.ip;

    const result = await this.rateLimits.isAllowed(clientId);

    if (!result.allowed) {
      throw new RateLimitedException(result.resetAt);
    }

    return next.handle();
  }
}
```

## Database Error Handling

```typescript
import { Prisma } from '@prisma/client';

async createOrder(dto: CreateOrderDto) {
  try {
    return await this.prisma.order.create({
      data: dto,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        throw new DuplicateException('Order reference already exists');
      }
      if (error.code === 'P2025') {
        // Record not found
        throw new ResourceNotFoundException('Related resource');
      }
    }
    throw new InternalServerException('Failed to create order');
  }
}
```

## Debugging with Trace IDs

### Get trace ID from error response
```bash
curl -i http://localhost:3000/api/orders/invalid
# X-Trace-ID: 1723075200000-abc123def
```

### Search logs for trace ID
```bash
grep "1723075200000-abc123def" logs/*.log
```

### Correlate across services
All services should respect and propagate X-Trace-ID header for full request tracing.
