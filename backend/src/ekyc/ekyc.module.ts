import { Module } from '@nestjs/common';
import { EkycService } from './ekyc.service';
import { EkycController } from './ekyc.controller';

@Module({
  controllers: [EkycController],
  providers: [EkycService],
  exports: [EkycService],
})
export class EkycModule {}
