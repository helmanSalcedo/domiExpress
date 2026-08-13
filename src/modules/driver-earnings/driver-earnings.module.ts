import { Module } from '@nestjs/common';
import { DriverEarningsService } from './services/driver-earnings.service';
import { DriverEarningsController } from './controllers/driver-earnings.controller';

@Module({
  controllers: [DriverEarningsController],
  providers: [DriverEarningsService],
  exports: [DriverEarningsService],
})
export class DriverEarningsModule {}
