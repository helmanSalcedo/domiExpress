import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(message: string | string[], public readonly errors?: Record<string, string[]>) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errors,
        error: 'ValidationError',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DuplicateException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'DuplicateError',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id "${id}" not found` : `${resource} not found`;
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message,
        error: 'NotFoundError',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Access forbidden') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        error: 'ForbiddenError',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'UnauthorizedError',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'BadRequestError',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InternalServerException extends HttpException {
  constructor(message: string = 'Internal server error') {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: 'InternalServerError',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class RateLimitedException extends HttpException {
  constructor(public readonly resetAt: Date) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: `Too many requests. Reset at ${resetAt.toISOString()}`,
        error: 'RateLimitedError',
        resetAt: resetAt.toISOString(),
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class PaymentException extends HttpException {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: Record<string, any>,
  ) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        message,
        code,
        details,
        error: 'PaymentError',
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

export class InvalidStateException extends HttpException {
  constructor(resource: string, currentState: string, requestedTransition: string) {
    const message = `Cannot transition ${resource} from ${currentState} to ${requestedTransition}`;
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'InvalidStateError',
      },
      HttpStatus.CONFLICT,
    );
  }
}
