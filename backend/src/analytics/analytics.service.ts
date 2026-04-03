import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(
    userId: string,
    type: 'buyer' | 'artisan',
    timeFilter: 'month' | 'quarter' | 'year',
    start?: string,
    end?: string,
  ) {
    const where: any = {
      status: 'completed',
    };

    if (type === 'buyer') {
      where.buyerId = userId;
    } else {
      where.artisanId = userId;
    }

    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt.gte = new Date(start);
      if (end) where.createdAt.lte = new Date(end);
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const categoriesMap: Record<string, number> = {};
    const chartMap: Record<
      string,
      { total: number; byCategory: Record<string, number> }
    > = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      let timeKey = '';
      if (timeFilter === 'month') {
        timeKey = `T${date.getMonth() + 1}/${date.getFullYear()}`;
      } else if (timeFilter === 'quarter') {
        timeKey = `Q${Math.floor(date.getMonth() / 3) + 1}/${date.getFullYear()}`;
      } else {
        timeKey = `${date.getFullYear()}`;
      }

      if (!chartMap[timeKey]) {
        chartMap[timeKey] = { total: 0, byCategory: {} };
      }

      order.orderItems.forEach((item) => {
        const catName = item.product.category.name;
        const lineTotal = item.price * item.quantity;

        // "Tỉ trọng danh mục" use quantities sold/bought
        categoriesMap[catName] = (categoriesMap[catName] || 0) + item.quantity;

        chartMap[timeKey].total += lineTotal;
        chartMap[timeKey].byCategory[catName] =
          (chartMap[timeKey].byCategory[catName] || 0) + lineTotal;
      });
    });

    const chartData = Object.entries(chartMap).map(([name, data]) => ({
      name,
      ...(type === 'buyer'
        ? { spent: data.total, spentByCategory: data.byCategory }
        : { revenue: data.total, revenueByCategory: data.byCategory }),
    }));

    const categoryData = Object.entries(categoriesMap).map(([name, value]) => ({
      name,
      value,
    }));

    let cancelReasons: { name: string; value: number }[] = [];
    if (type === 'artisan') {
      const cancelledOrders = await this.prisma.order.findMany({
        where: {
          artisanId: userId,
          status: 'cancelled',
          ...(start || end ? { createdAt: where.createdAt } : {}),
        },
        select: { cancelReason: true },
      });
      const reasonsMap: Record<string, number> = {};
      cancelledOrders.forEach((o) => {
        const r = o.cancelReason || 'Không xác định';
        reasonsMap[r] = (reasonsMap[r] || 0) + 1;
      });
      cancelReasons = Object.entries(reasonsMap).map(([name, value]) => ({
        name,
        value,
      }));
    }

    return { chartData, categoryData, cancelReasons };
  }
}
