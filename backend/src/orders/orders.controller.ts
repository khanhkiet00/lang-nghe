import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** POST /orders — người mua tạo đơn hàng mới */
  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    const data = await this.ordersService.createOrder(req.user.sub, dto);
    return { message: 'Đặt hàng thành công', data };
  }

  /** GET /orders/artisan — đơn hàng nghệ nhân cần xử lý */
  @Get('artisan')
  async listArtisan(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListOrdersDto,
  ) {
    const data = await this.ordersService.listArtisanOrders(
      req.user.sub,
      query,
    );
    return { data };
  }

  /** GET /orders/buyer — lịch sử mua hàng của buyer */
  @Get('buyer')
  async listBuyer(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListOrdersDto,
  ) {
    const data = await this.ordersService.listBuyerOrders(req.user.sub, query);
    return { data };
  }

  /** GET /orders/:id — chi tiết đơn hàng */
  @Get(':id')
  async getOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const data = await this.ordersService.getOrderById(id, req.user.sub);
    return { data };
  }

  /** PATCH /orders/:id/status — nghệ nhân cập nhật trạng thái */
  @Patch(':id/status')
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const data = await this.ordersService.updateOrderStatus(
      id,
      req.user.sub,
      dto,
    );
    return { message: 'Cập nhật trạng thái thành công', data };
  }
}
