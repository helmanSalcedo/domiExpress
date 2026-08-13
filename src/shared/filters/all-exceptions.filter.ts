import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = (request.headers['x-trace-id'] as string) || this.generateTraceId();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorType = 'InternalServerError';

    if (exception instanceof Error) {
      message = exception.message;
      errorType = exception.constructor.name;

      // Log full stack trace for unexpected errors
      this.logger.error(
        `[${traceId}] Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `[${traceId}] Unknown exception type`,
        JSON.stringify(exception),
      );
    }

    response
      .status(status)
      .set('X-Trace-ID', traceId)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message,
        error: errorType,
        traceId,
      });
  }

  private generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
