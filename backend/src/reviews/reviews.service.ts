import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReactToReviewDto, ReplyToReviewDto } from './dto/review-interaction.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  private getReviewAverage(review: {
    rating_quality: number;
    rating_accuracy: number;
    rating_shipping: number;
    rating_communication: number;
    rating_payment: number;
  }) {
    return (
      review.rating_quality +
      review.rating_accuracy +
      review.rating_shipping +
      review.rating_communication +
      review.rating_payment
    ) / 5;
  }

  private async refreshReputationScore(revieweeId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { reviewee_id: revieweeId },
      select: {
        rating_quality: true,
        rating_accuracy: true,
        rating_shipping: true,
        rating_communication: true,
        rating_payment: true,
      },
    });

    const reputationScore = reviews.length
      ? Number(
          (
            reviews.reduce(
              (sum, review) => sum + this.getReviewAverage(review),
              0,
            ) / reviews.length
          ).toFixed(2),
        )
      : 0;

    await this.prisma.user.update({
      where: { id: revieweeId },
      data: { reputationScore },
    });

    return reputationScore;
  }

  private decorateReviewInteractions<T extends { reactions?: { value: string }[]; replies?: unknown[] }>(
    review: T,
  ) {
    const reactions = review.reactions ?? [];
    const replies = review.replies ?? [];
    return {
      ...review,
      likeCount: reactions.filter((item) => item.value === 'like').length,
      dislikeCount: reactions.filter((item) => item.value === 'dislike').length,
      replyCount: replies.length,
    };
  }

  async createReview(reviewerId: string, dto: CreateReviewDto) {
    if (reviewerId === dto.reviewee_id) {
      throw new BadRequestException('Khong the tu danh gia chinh minh');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: dto.order_id },
      select: {
        id: true,
        status: true,
        buyerId: true,
        artisanId: true,
        orderItems: { select: { productId: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Don hang khong ton tai');
    }

    if (order.status.toUpperCase() !== 'COMPLETED') {
      throw new BadRequestException(
        'Chỉ được đánh giá sau khi đơn hàng đã hoàn thành',
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

    const productReviews = dto.product_reviews ?? [];
    if (productReviews.length > 0 && order.buyerId !== reviewerId) {
      throw new BadRequestException('Chi nguoi mua moi duoc danh gia san pham');
    }

    const orderProductIds = new Set(order.orderItems.map((item) => item.productId));
    const duplicateProductIds = new Set<string>();
    const seenProductIds = new Set<string>();

    for (const productReview of productReviews) {
      if (!orderProductIds.has(productReview.product_id)) {
        throw new BadRequestException(
          'Chi duoc danh gia san pham thuoc don hang nay',
        );
      }
      if (seenProductIds.has(productReview.product_id)) {
        duplicateProductIds.add(productReview.product_id);
      }
      seenProductIds.add(productReview.product_id);
    }

    if (duplicateProductIds.size > 0) {
      throw new BadRequestException(
        'Moi san pham trong don hang chi duoc gui mot danh gia',
      );
    }

    try {
      const result = await this.prisma.$transaction(async (tx: any) => {
        const review = await tx.review.create({
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
            images: [],
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

        const createdProductReviews: any[] = [];
        for (const productReview of productReviews) {
          createdProductReviews.push(
            await tx.productReview.create({
              data: {
                reviewer_id: reviewerId,
                productId: productReview.product_id,
                orderId: dto.order_id,
                rating: productReview.rating,
                comment: productReview.comment,
                images: productReview.images ?? [],
              },
            }),
          );
        }

        return { review, productReviews: createdProductReviews };
      });

      const reputationScore = await this.refreshReputationScore(dto.reviewee_id);

      return {
        ...result.review,
        productReviews: result.productReviews,
        revieweeReputationScore: reputationScore,
      };
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const prismaError = error as { code?: string };
        if (prismaError.code === 'P2002') {
          throw new ConflictException('Bạn đã đánh giá đơn hàng này rồi');
        }
      }
      throw error;
    }
  }

  async listReviewsForUser(userId: string) {
    const reviews = await this.prisma.review.findMany({
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
        reactions: { select: { value: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                profile: { select: { display_name: true, avatar_url: true } },
              },
            },
          },
        },
      },
    });

    const averageRating = reviews.length
      ? Number(
          (
            reviews.reduce(
              (sum, review) => sum + this.getReviewAverage(review),
              0,
            ) / reviews.length
          ).toFixed(2),
        )
      : 0;

    return {
      items: reviews.map((review) => this.decorateReviewInteractions(review)),
      summary: {
        total: reviews.length,
        averageRating,
      },
    };
  }

  async listProductReviews(productId: string) {
    const reviews = await this.prisma.productReview.findMany({
      where: { productId },
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
        reactions: { select: { value: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                profile: { select: { display_name: true, avatar_url: true } },
              },
            },
          },
        },
      },
    });

    const averageRating = reviews.length
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          ).toFixed(2),
        )
      : 0;

    return {
      items: reviews.map((review) => this.decorateReviewInteractions(review)),
      summary: {
        total: reviews.length,
        averageRating,
      },
    };
  }

  async reactToReview(
    userId: string,
    type: 'artisan' | 'product',
    reviewId: string,
    dto: ReactToReviewDto,
  ) {
    const where =
      type === 'artisan' ? { id: reviewId } : { id: reviewId };
    const existingReview =
      type === 'artisan'
        ? await this.prisma.review.findUnique({ where, select: { id: true } })
        : await this.prisma.productReview.findUnique({
            where,
            select: { id: true },
          });

    if (!existingReview) {
      throw new NotFoundException('Khong tim thay danh gia');
    }

    const existingReaction = await this.prisma.reviewReaction.findFirst({
      where:
        type === 'artisan'
          ? { reviewId, userId }
          : { productReviewId: reviewId, userId },
    });

    if (existingReaction?.value === dto.value) {
      await this.prisma.reviewReaction.delete({
        where: { id: existingReaction.id },
      });
    } else if (existingReaction) {
      await this.prisma.reviewReaction.update({
        where: { id: existingReaction.id },
        data: { value: dto.value },
      });
    } else {
      await this.prisma.reviewReaction.create({
        data:
          type === 'artisan'
            ? { reviewId, userId, value: dto.value }
            : { productReviewId: reviewId, userId, value: dto.value },
      });
    }

    const reactions = await this.prisma.reviewReaction.findMany({
      where:
        type === 'artisan'
          ? { reviewId }
          : { productReviewId: reviewId },
      select: { value: true },
    });

    return {
      likeCount: reactions.filter((item) => item.value === 'like').length,
      dislikeCount: reactions.filter((item) => item.value === 'dislike').length,
    };
  }

  async replyToReview(
    userId: string,
    type: 'artisan' | 'product',
    reviewId: string,
    dto: ReplyToReviewDto,
  ) {
    const existingReview =
      type === 'artisan'
        ? await this.prisma.review.findUnique({
            where: { id: reviewId },
            select: { id: true },
          })
        : await this.prisma.productReview.findUnique({
            where: { id: reviewId },
            select: { id: true },
          });

    if (!existingReview) {
      throw new NotFoundException('Khong tim thay danh gia');
    }

    return this.prisma.reviewReply.create({
      data:
        type === 'artisan'
          ? { reviewId, authorId: userId, content: dto.content }
          : { productReviewId: reviewId, authorId: userId, content: dto.content },
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { display_name: true, avatar_url: true } },
          },
        },
      },
    });
  }
}
