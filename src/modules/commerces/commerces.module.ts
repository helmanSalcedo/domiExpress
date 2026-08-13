import { Module } from '@nestjs/common';
import { CommercesService } from './services/commerces.service';
import { CommercesController } from './controllers/commerces.controller';

@Module({
  controllers: [CommercesController],
  providers: [CommercesService],
  exports: [CommercesService],
})
export class CommercesModule {}
