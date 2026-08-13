import { Injectable, NestInterceptor, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: any): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, headers } = request;
    const startTime = Date.now();
    const traceId =
      (headers['x-trace-id'] as string) ||
      `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Attach trace ID to response
    response.set('X-Trace-ID', traceId);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Log based on status
        if (statusCode >= 500) {
          this.logger.error(`[${traceId}] ${method} ${url} - ${statusCode} (${duration}ms)`);
        } else if (statusCode >= 400) {
          this.logger.warn(`[${traceId}] ${method} ${url} - ${statusCode} (${duration}ms)`);
        } else {
          this.logger.log(`[${traceId}] ${method} ${url} - ${statusCode} (${duration}ms)`);
        }
      }),
      catchError(error => {
        const duration = Date.now() - startTime;
        this.logger.error(`[${traceId}] ${method} ${url} - ERROR (${duration}ms)`, error.message);
        return throwError(() => error);
      }),
    );
  }
}
