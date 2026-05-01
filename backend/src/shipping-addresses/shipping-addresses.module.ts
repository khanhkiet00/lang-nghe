import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ShippingAddressesController } from './shipping-addresses.controller';
import { ShippingAddressesService } from './shipping-addresses.service';

@Module({
  imports: [PrismaModule],
  controllers: [ShippingAddressesController],
  providers: [ShippingAddressesService],
})
export class ShippingAddressesModule {}
