import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
}

export interface ReadinessStatus extends HealthStatus {
  database: string;
  redis: string;
}

@Injectable()
export class HealthService {
  check(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  }

  async ready(): Promise<ReadinessStatus> {
    // TODO: Check database connection
    // TODO: Check Redis connection
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      database: 'pending',
      redis: 'pending',
    };
  }

  live(): HealthStatus {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  }
}
