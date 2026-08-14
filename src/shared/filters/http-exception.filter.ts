import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  traceId?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const traceId = (request.headers['x-trace-id'] as string) || this.generateTraceId();

    let errorMessage: string = 'Internal server error';
    let errorType = 'HttpException';

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObject = exceptionResponse as any;
      errorMessage = responseObject.message || errorMessage;
      errorType = responseObject.error || status;
    } else {
      errorMessage = exceptionResponse;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
      error: errorType,
      traceId,
    };

    // Log based on status code
    if (status >= 500) {
      this.logger.error(`[${traceId}] ${request.method} ${request.url}`, {
        status,
        message: errorMessage,
        headers: request.headers,
      });
    } else if (status >= 400) {
      this.logger.warn(`[${traceId}] ${request.method} ${request.url} - ${status}`);
    }

    response.status(status).set('X-Trace-ID', traceId).json(errorResponse);
  }

  private generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
