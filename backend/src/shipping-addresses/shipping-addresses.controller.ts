import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { ShippingAddressesService } from './shipping-addresses.service';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';

@Controller('shipping-addresses')
@UseGuards(AuthGuard('jwt'))
export class ShippingAddressesController {
  constructor(private readonly addressesService: ShippingAddressesService) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    const data = await this.addressesService.list(req.user.sub);
    return { data };
  }

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateShippingAddressDto,
  ) {
    const data = await this.addressesService.create(req.user.sub, body);
    return { message: 'Đã lưu địa chỉ nhận hàng', data };
  }

  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateShippingAddressDto,
  ) {
    const data = await this.addressesService.update(req.user.sub, id, body);
    return { message: 'Đã cập nhật địa chỉ nhận hàng', data };
  }

  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const data = await this.addressesService.remove(req.user.sub, id);
    return { message: 'Đã xóa địa chỉ nhận hàng', data };
  }
}
