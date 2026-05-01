import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private async buildUniqueProductSlug(
    title: string,
    excludeProductId?: string,
  ): Promise<string> {
    const base =
      slugify(title, { lower: true, strict: true, trim: true }) || 'san-pham';

    let attempt = 0;
    while (attempt < 100) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      const existing = await this.prisma.product.findFirst({
        where: { slug: candidate, isDeleted: false },
        select: { id: true },
      });

      if (!existing || existing.id === excludeProductId) {
        return candidate;
      }
      attempt += 1;
    }

    throw new ConflictException('Khong the tao slug san pham duy nhat');
  }

  async createProduct(userId: string, dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { slug: dto.category_slug },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Danh muc khong ton tai');
    }

    const slug = await this.buildUniqueProductSlug(dto.title);

    const product = await this.prisma.product.create({
      data: {
        artisanId: userId,
        categoryId: category.id,
        title: dto.title,
        slug,
        description: dto.description,
        price_retail: dto.price_retail,
        price_wholesale: dto.price_wholesale,
        quantity: dto.quantity,
        material: dto.material,
        origin: dto.origin,
        processingTime: dto.processingTime,
        isCustomizable: dto.isCustomizable,
        weight: dto.weight,
        isOneOfAKind: dto.isOneOfAKind,
        images: dto.images?.length
          ? { create: dto.images.map((url) => ({ url })) }
          : undefined,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { select: { id: true, url: true } },
      },
    });

    return product;
  }

  async listMyProducts(userId: string, query: ListProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: any = {
      artisanId: userId,
      isDeleted: false,
    };

    if (query.search) {
      // Tìm kiếm không dấu sử dụng unaccent của Postgres
      const searchPattern = `%${query.search}%`;
      const matchedIds = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Product"
        WHERE unaccent(title) ILIKE unaccent(${searchPattern})
           OR unaccent(description) ILIKE unaccent(${searchPattern})
      `;
      const ids = matchedIds.map((row) => row.id);
      
      // Nếu không tìm thấy ID nào thì chắc chắn không có kết quả
      if (ids.length === 0) {
        return {
          items: [],
          pagination: { page, limit, total: 0, totalPages: 1 },
        };
      }
      where.id = { in: ids };
    }

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { select: { id: true, url: true } },
        },
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

  async getProductById(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isDeleted: false },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { select: { id: true, url: true } },
        artisan: {
          select: {
            id: true,
            artisanProfile: {
              select: { fullName: true, slug: true, avatarUrl: true },
            },
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    return product;
  }

  async listPublicProducts(query: ListProductsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const where: any = {
      isActive: true,
      isDeleted: false,
    };

    if (query.category_slug) {
      where.category = { slug: query.category_slug };
    }

    if (query.search) {
      const searchPattern = `%${query.search}%`;
      const matchedIds = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Product"
        WHERE unaccent(title) ILIKE unaccent(${searchPattern})
           OR unaccent(description) ILIKE unaccent(${searchPattern})
      `;
      const ids = matchedIds.map((row) => row.id);
      if (ids.length === 0) {
        return {
          items: [],
          pagination: { page, limit, total: 0, totalPages: 1 },
        };
      }
      where.id = { in: ids };
    }

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { select: { id: true, url: true } },
          artisan: {
            select: {
              id: true,
              profile: {
                select: { display_name: true, slug: true, avatar_url: true },
              },
            },
          },
        },
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

  async updateProduct(
    userId: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    const existingProduct = await this.prisma.product.findFirst({
      where: { id: productId, isDeleted: false },
      select: { id: true, artisanId: true, title: true, version: true },
    });

    if (!existingProduct) {
      throw new NotFoundException('San pham khong ton tai');
    }

    if (existingProduct.artisanId !== userId) {
      throw new ForbiddenException('Ban khong co quyen sua san pham nay');
    }

    let nextCategoryId: string | undefined;
    if (dto.category_slug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: dto.category_slug },
        select: { id: true },
      });
      if (!category) {
        throw new NotFoundException('Danh muc khong ton tai');
      }
      nextCategoryId = category.id;
    }

    const nextTitle = dto.title ?? existingProduct.title;
    const nextSlug = dto.title
      ? await this.buildUniqueProductSlug(nextTitle, existingProduct.id)
      : undefined;

    try {
      return await this.prisma.product.update({
        where: { id: productId, version: dto.version },
        data: {
          title: dto.title,
          slug: nextSlug,
          description: dto.description,
          categoryId: nextCategoryId,
          price_retail: dto.price_retail,
          price_wholesale: dto.price_wholesale,
          quantity: dto.quantity,
          isActive: dto.isActive,
          material: dto.material,
          origin: dto.origin,
          processingTime: dto.processingTime,
          isCustomizable: dto.isCustomizable,
          weight: dto.weight,
          isOneOfAKind: dto.isOneOfAKind,
          version: { increment: 1 },
          images:
            dto.images !== undefined
              ? {
                  deleteMany: {},
                  create: dto.images.map((url) => ({ url })),
                }
              : undefined,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { select: { id: true, url: true } },
        },
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const prismaError = error as { code?: string };
        if (prismaError.code === 'P2025') {
          throw new ConflictException(
            'Du lieu da thay doi boi nguoi khac, vui long tai lai va thu lai',
          );
        }
      }
      throw error;
    }
  }

  async softDeleteProduct(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, artisanId: true },
    });

    if (!product) {
      throw new NotFoundException('San pham khong ton tai');
    }

    if (product.artisanId !== userId) {
      throw new ForbiddenException('Ban khong co quyen xoa san pham nay');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { isDeleted: true, isActive: false },
    });
  }
}
