import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return ok status', () => {
      const result = controller.checkHealth();
      expect(result.status).toBe('ok');
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('live', () => {
    it('should return alive status', () => {
      const result = controller.liveness();
      expect(result.status).toBe('alive');
    });
  });

  describe('ready', () => {
    it('should return ready status', async () => {
      const result = await controller.readiness();
      expect(result.status).toBe('ready');
      expect(result.database).toBeDefined();
      expect(result.redis).toBeDefined();
    });
  });
});
