import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ListOrdersDto } from './dto/list-orders.dto';

const ORDER_INCLUDE = {
  buyer: {
    select: {
      id: true,
      email: true,
      profile: { select: { display_name: true, avatar_url: true } },
    },
  },
  artisan: {
    select: {
      id: true,
      artisanProfile: {
        select: { fullName: true, avatarUrl: true, slug: true },
      },
    },
  },
  orderItems: {
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          images: { select: { url: true }, take: 1 },
        },
      },
    },
  },
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Người mua thực hiện đặt hàng (Checkout) */
  async createOrder(buyerId: string, dto: CreateOrderDto) {
    // 1. Kiểm tra tồn tại nghệ nhân
    const artisan = await this.prisma.user.findUnique({
      where: { id: dto.artisanId },
      include: { artisanProfile: true },
    });
    if (!artisan || !artisan.artisanProfile) {
      throw new NotFoundException('Không tìm thấy nghệ nhân này');
    }

    // 2. Lấy thông tin sản phẩm và tính toán tổng tiền
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, artisanId: dto.artisanId, isActive: true },
    });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('Một số sản phẩm không tồn tại hoặc đã ngừng bán');
    }

    let subtotal = 0;
    const itemsWithPrices = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error('Unreachable');
      if (product.quantity < item.quantity) {
        throw new BadRequestException(`Sản phẩm "${product.title}" chỉ còn ${product.quantity} bản`);
      }
      subtotal += product.price_retail * item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price_retail,
      };
    });

    // 3. Tính toán phí vận chuyển (Tạm thời 30k cố định hoặc tính theo cân nặng nếu có API)
    // Giả sử: 30k cho đơn dưới 500k, free cho trên 500k
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const platformFee = Math.round(subtotal * 0.05); // 5% fee
    const artisanAmount = subtotal - platformFee;

    // 4. Tạo đơn hàng (Transaction)
    return this.prisma.$transaction(async (tx: any) => {
      const order = await tx.order.create({
        data: {
          buyerId,
          artisanId: dto.artisanId,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: dto.paymentMethod,
          subtotal,
          shippingFee,
          platformFee,
          artisanAmount,
          shippingAddress: dto.shippingAddress as any,
          noteFromBuyer: dto.noteFromBuyer,
          orderItems: {
            create: itemsWithPrices,
          },
        },
        include: ORDER_INCLUDE,
      });

      // 5. Trừ tồn kho (Basic approach)
      for (const item of itemsWithPrices) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      return order;
    });
  }

  /** Nghệ nhân xem đơn hàng cần xử lý */
  async listArtisanOrders(artisanId: string, query: ListOrdersDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where = {
      artisanId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: ORDER_INCLUDE,
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /** Người mua xem lịch sử đơn hàng */
  async listBuyerOrders(buyerId: string, query: ListOrdersDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where = {
      buyerId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: ORDER_INCLUDE,
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /** Xem chi tiết 1 đơn hàng (artisan hoặc buyer) */
  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: ORDER_INCLUDE,
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.buyerId !== userId && order.artisanId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }

    return order;
  }

  /** Nghệ nhân cập nhật trạng thái đơn hàng */
  async updateOrderStatus(
    orderId: string,
    artisanId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (order.artisanId !== artisanId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật đơn hàng này');
    }

    // Kiểm tra luồng trạng thái hợp lệ
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['completed'],
      completed: [],
      cancelled: [],
    };

    const allowed = validTransitions[order.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ trạng thái "${order.status}" sang "${dto.status}"`,
      );
    }

    if (dto.status === 'cancelled' && !dto.cancelReason) {
      throw new BadRequestException('Vui lòng cung cấp lý do hủy đơn');
    }

    const now = new Date();
    const timeFields: Record<
      string,
      Partial<{ deliveredAt: Date; completedAt: Date }>
    > = {
      delivered: { deliveredAt: now },
      completed: { completedAt: now },
    };

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        ...(dto.cancelReason ? { cancelReason: dto.cancelReason } : {}),
        ...(dto.trackingCode ? { trackingCode: dto.trackingCode } : {}),
        ...(dto.shippingProvider
          ? { shippingProvider: dto.shippingProvider }
          : {}),
        ...(dto.noteFromArtisan
          ? { noteFromArtisan: dto.noteFromArtisan }
          : {}),
        ...(timeFields[dto.status] ?? {}),
      },
      include: ORDER_INCLUDE,
    });
  }
}
