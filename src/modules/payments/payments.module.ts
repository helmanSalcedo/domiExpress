import { Module } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './controllers/payments.controller';
import { WompiClient } from './wompi-client/wompi.client';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, WompiClient],
  exports: [PaymentsService, WompiClient],
})
export class PaymentsModule {}
