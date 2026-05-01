import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';

@Injectable()
export class ShippingAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return (this.prisma as any).shippingAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateShippingAddressDto) {
    return this.prisma.$transaction(async (tx: any) => {
      const count = await tx.shippingAddress.count({ where: { userId } });
      const isDefault = dto.isDefault ?? count === 0;

      if (isDefault) {
        await tx.shippingAddress.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.shippingAddress.create({
        data: {
          userId,
          label: dto.label,
          name: dto.name,
          phone: dto.phone,
          address: dto.address,
          ward: dto.ward,
          district: dto.district,
          province: dto.province,
          isDefault,
        },
      });
    });
  }

  async update(userId: string, id: string, dto: UpdateShippingAddressDto) {
    const existing = await (this.prisma as any).shippingAddress.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy địa chỉ nhận hàng');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa địa chỉ này');
    }

    return this.prisma.$transaction(async (tx: any) => {
      if (dto.isDefault) {
        await tx.shippingAddress.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.shippingAddress.update({
        where: { id },
        data: dto,
      });
    });
  }

  async remove(userId: string, id: string) {
    const existing = await (this.prisma as any).shippingAddress.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy địa chỉ nhận hàng');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa địa chỉ này');
    }

    await (this.prisma as any).shippingAddress.delete({ where: { id } });
    return { deleted: true };
  }
}
