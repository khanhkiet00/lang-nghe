import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';
import slugify from 'slugify';

@Injectable()
export class ArtisansService {
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

  private async getReviewSummary(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { reviewee_id: userId },
      select: {
        rating_quality: true,
        rating_accuracy: true,
        rating_shipping: true,
        rating_communication: true,
        rating_payment: true,
      },
    });

    return {
      total: reviews.length,
      averageRating: reviews.length
        ? Number(
            (
              reviews.reduce(
                (sum, review) => sum + this.getReviewAverage(review),
                0,
              ) / reviews.length
            ).toFixed(2),
          )
        : 0,
    };
  }

  private buildSlug(text: string): string {
    return (
      slugify(text, { lower: true, strict: true, trim: true }) || 'nghe-nhan'
    );
  }

  async createOrUpdateProfile(userId: string, data: CreateArtisanProfileDto) {
    // Cho phép trùng tên, nhưng slug URL phải unique: thêm suffix userId nếu trùng
    const slug = this.buildSlug(data.fullName);
    const existingBySlug = await this.prisma.artisanProfile.findUnique({
      where: { slug },
    });
    const finalSlug =
      existingBySlug && existingBySlug.userId !== userId
        ? `${slug}-${userId.slice(0, 6)}`
        : slug;

    const existingProfile = await this.prisma.artisanProfile.findUnique({
      where: { userId },
    });

    const payload = {
      fullName: data.fullName,
      slug: finalSlug,
      description: data.description,
      expertise: data.expertise,
      location: data.location,
      avatarUrl: data.avatarUrl,
      cccdUrl: data.cccdUrl,
    };

    if (existingProfile) {
      await this.prisma.artisanProfile.update({
        where: { userId },
        data: payload,
      });
    } else {
      await this.prisma.artisanProfile.create({
        data: {
          userId,
          ...payload,
        },
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { phone: data.phone },
    });

    return payload;
  }

  async registerArtisan(userId: string, data: CreateArtisanProfileDto) {
    const slug = this.buildSlug(data.fullName);

    // Cho phép trùng tên, nhưng slug URL phải unique: thêm suffix userId nếu trùng
    const existingBySlug = await this.prisma.artisanProfile.findUnique({
      where: { slug },
    });
    const finalSlug =
      existingBySlug && existingBySlug.userId !== userId
        ? `${slug}-${userId.slice(0, 6)}`
        : slug;

    const payload = {
      fullName: data.fullName,
      slug: finalSlug,
      description: data.description,
      expertise: data.expertise,
      location: data.location,
      avatarUrl: data.avatarUrl,
      cccdUrl: data.cccdUrl,
      isVerified: true, // Auto-accept as per user request
    };

    return this.prisma.$transaction(async (tx: any) => {
      // 1. Create or Update Artisan Profile
      const existingProfile = await tx.artisanProfile.findUnique({
        where: { userId },
      });

      let profile;
      if (existingProfile) {
        profile = await tx.artisanProfile.update({
          where: { userId },
          data: payload,
        });
      } else {
        profile = await tx.artisanProfile.create({
          data: {
            userId,
            ...payload,
          },
        });
      }

      // 2. Ensure user has 'artisan' role
      const existingRole = await (tx as any).userRole.findFirst({
        where: { userId, role: 'artisan' },
      });

      if (!existingRole) {
        await (tx as any).userRole.create({
          data: { userId, role: 'artisan' },
        });
      }

      await (tx as any).user.update({
        where: { id: userId },
        data: { phone: data.phone },
      });

      return profile;
    });
  }

  async getProfileBySlug(slug: string) {
    const profile = await this.prisma.artisanProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            reputationScore: true,
            products: {
              where: { isActive: true, isDeleted: false },
              orderBy: { createdAt: 'desc' },
              take: 12,
              include: {
                category: { select: { id: true, name: true, slug: true } },
                images: { select: { id: true, url: true } },
              },
            },
          },
        },
      },
    });
    if (!profile) {
      throw new NotFoundException('Không tìm thấy artisan');
    }
    return {
      ...profile,
      user: {
        ...profile.user,
        reviewSummary: await this.getReviewSummary(profile.user.id),
      },
    };
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.artisanProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            reputationScore: true,
          },
        },
      },
    });
    if (!profile) {
      throw new NotFoundException('Không tìm thấy artisan');
    }
    return {
      ...profile,
      user: {
        ...profile.user,
        reviewSummary: await this.getReviewSummary(profile.user.id),
      },
    };
  }
}
