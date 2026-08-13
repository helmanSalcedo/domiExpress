import { Module } from '@nestjs/common';
import { DeliveriesService } from './services/deliveries.service';
import { DeliveriesController } from './controllers/deliveries.controller';

@Module({
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
