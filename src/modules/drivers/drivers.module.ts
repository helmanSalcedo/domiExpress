import { Module } from '@nestjs/common';
import { DriversService } from './services/drivers.service';
import { DriversController } from './controllers/drivers.controller';

@Module({
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
