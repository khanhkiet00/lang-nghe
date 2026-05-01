import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import slugify from 'slugify';
import { UpdateProfileDto } from './dto/update-profile.dto';

export type UserWithRoles = User & { roles: UserRole[] };

@Injectable()
export class UsersService {
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

  private async buildUniqueProfileSlug(
    displayName: string,
    excludeUserId?: string,
  ): Promise<string> {
    const base =
      slugify(displayName, { lower: true, strict: true, trim: true }) ||
      'nguoi-dung';

    let attempt = 0;
    while (attempt < 100) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      const existing = await this.prisma.profile.findUnique({
        where: { slug: candidate },
        select: { userId: true },
      });

      if (!existing || existing.userId === excludeUserId) {
        return candidate;
      }
      attempt += 1;
    }

    throw new ConflictException('Khong the tao slug profile duy nhat');
  }

  async findByEmail(email: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });
  }

  async findById(id: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
  }

  async create(data: {
    email: string;
    phone?: string;
    password: string;
    roles?: string[];
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        password: data.password,
        roles: {
          create: data.roles?.map((role) => ({ role })) ?? [{ role: 'buyer' }],
        },
      },
      include: { roles: true },
    });
  }

  async getMeDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        reputationScore: true,
        createdAt: true,
        roles: { select: { role: true, isActive: true } },
        artisanProfile: {
          select: {
            fullName: true,
            slug: true,
            isVerified: true,
          },
        },
        profile: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        products: {
          where: { isActive: true, isDeleted: false },
          orderBy: { createdAt: 'desc' },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Khong tim thay nguoi dung');
    }

    const productCount = await this.prisma.product.count({
      where: { artisanId: userId, isActive: true, isDeleted: false },
    });

    // Đảm bảo trả về đúng định dạng object _count mà frontend mong đợi
    return {
      ...user,
      reviewSummary: await this.getReviewSummary(userId),
      _count: {
        followers: user._count.followers,
        following: user._count.following,
        products: productCount,
      },
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, profile: true },
    });

    if (!user) {
      throw new NotFoundException('Khong tim thay nguoi dung');
    }

    const fallbackDisplayName = user.email.split('@')[0] || 'nguoi-dung';
    const nextDisplayName =
      data.display_name ?? user.profile?.display_name ?? fallbackDisplayName;

    const shouldRefreshSlug =
      !user.profile ||
      Boolean(
        data.display_name && data.display_name !== user.profile.display_name,
      );

    const nextSlug = shouldRefreshSlug
      ? await this.buildUniqueProfileSlug(nextDisplayName, user.id)
      : user.profile!.slug;

    if (!user.profile) {
      return this.prisma.profile.create({
        data: {
          userId: user.id,
          display_name: nextDisplayName,
          slug: nextSlug,
          bio: data.bio,
          village: data.village,
          avatar_url: data.avatar_url,
        },
      });
    }

    return this.prisma.profile.update({
      where: { userId: user.id },
      data: {
        display_name: nextDisplayName,
        slug: nextSlug,
        bio: data.bio ?? user.profile.bio,
        village: data.village ?? user.profile.village,
        avatar_url: data.avatar_url ?? user.profile.avatar_url,
      },
    });
  }

  async addRole(userId: string, role: string): Promise<UserRole> {
    return this.prisma.userRole.create({
      data: { userId, role },
    });
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Khong the theo doi chinh minh');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      throw new NotFoundException('Khong tim thay nguoi dung can theo doi');
    }

    const status = await this.getFollowStatus(followerId, followingId);

    if (status.isFollowing) {
      await this.prisma.user.update({
        where: { id: followerId },
        data: {
          following: {
            disconnect: { id: followingId },
          },
        },
      });

      return { following: false };
    }

    await this.prisma.user.update({
      where: { id: followerId },
      data: {
        following: {
          connect: { id: followingId },
        },
      },
    });

    return { following: true };
  }

  async unfollowUser(followerId: string, followingId: string) {
    await this.prisma.user.update({
      where: { id: followerId },
      data: {
        following: {
          disconnect: { id: followingId },
        },
      },
    });

    return { following: false };
  }

  async getFollowStatus(followerId: string, followingId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: {
        following: {
          where: { id: followingId },
          select: { id: true },
        },
      },
    });

    return { isFollowing: (user?.following?.length ?? 0) > 0 };
  }

  async getPublicProfileBySlug(slug: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            reputationScore: true,
            createdAt: true,
            _count: {
              select: {
                followers: true,
                following: true,
                products: {
                  where: { isActive: true, isDeleted: false },
                },
              },
            },
            products: {
              where: { isActive: true, isDeleted: false },
              orderBy: { createdAt: 'desc' },
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
      throw new NotFoundException('Khong tim thay ho so cong khai');
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
