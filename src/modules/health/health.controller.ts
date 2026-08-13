import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { HealthService, HealthStatus, ReadinessStatus } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check server health' })
  @ApiOkResponse({ description: 'Server is healthy' })
  checkHealth(): HealthStatus {
    return this.healthService.check();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check readiness (dependencies available)' })
  @ApiOkResponse({ description: 'Server is ready' })
  async readiness(): Promise<ReadinessStatus> {
    return this.healthService.ready();
  }

  @Get('live')
  @ApiOperation({ summary: 'Check liveness (server is running)' })
  @ApiOkResponse({ description: 'Server is alive' })
  liveness(): HealthStatus {
    return this.healthService.live();
  }
}
