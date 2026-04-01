import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(reviewerId: string, dto: CreateReviewDto) {
    if (reviewerId === dto.reviewee_id) {
      throw new BadRequestException('Khong the tu danh gia chinh minh');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: dto.order_id },
      select: { id: true, status: true, buyerId: true, artisanId: true },
    });

    if (!order) {
      throw new NotFoundException('Don hang khong ton tai');
    }

    if (order.status.toUpperCase() !== 'COMPLETED') {
      throw new BadRequestException(
        'Chi duoc danh gia khi don hang da COMPLETED',
      );
    }

    const isBuyerReviewingArtisan =
      order.buyerId === reviewerId && order.artisanId === dto.reviewee_id;
    const isArtisanReviewingBuyer =
      order.artisanId === reviewerId && order.buyerId === dto.reviewee_id;

    if (!isBuyerReviewingArtisan && !isArtisanReviewingBuyer) {
      throw new BadRequestException(
        'Chi nguoi mua va nghe nhan trong don hang moi duoc phep danh gia nhau',
      );
    }

    try {
      return await this.prisma.review.create({
        data: {
          reviewer_id: reviewerId,
          reviewee_id: dto.reviewee_id,
          order_id: dto.order_id,
          rating_quality: dto.rating_quality,
          rating_accuracy: dto.rating_accuracy,
          rating_shipping: dto.rating_shipping,
          rating_communication: dto.rating_communication,
          rating_payment: dto.rating_payment,
          comment: dto.comment,
          images: dto.images ?? [],
        },
        include: {
          reviewer: {
            select: {
              id: true,
              profile: {
                select: {
                  display_name: true,
                  slug: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const prismaError = error as { code?: string };
        if (prismaError.code === 'P2002') {
          throw new ConflictException('Danh gia nay da ton tai');
        }
      }
      throw error;
    }
  }

  async listReviewsForUser(userId: string) {
    return this.prisma.review.findMany({
      where: { reviewee_id: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            profile: {
              select: {
                display_name: true,
                slug: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });
  }
}
