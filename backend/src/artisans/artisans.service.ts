import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';

@Injectable()
export class ArtisansService {
  constructor(private readonly prisma: PrismaService) {}

  private buildSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createOrUpdateProfile(userId: string, data: CreateArtisanProfileDto) {
    const slug = this.buildSlug(data.fullName);

    const existingBySlug = await this.prisma.artisanProfile.findUnique({
      where: { slug },
    });
    if (existingBySlug && existingBySlug.userId !== userId) {
      throw new Error('Slug đã tồn tại, vui lòng đổi tên khác');
    }

    const existingProfile = await this.prisma.artisanProfile.findUnique({
      where: { userId },
    });

    const payload = {
      fullName: data.fullName,
      slug,
      description: data.description,
      expertise: data.expertise,
      location: data.location,
      avatarUrl: data.avatarUrl,
      cccdUrl: data.cccdUrl,
    };

    if (existingProfile) {
      return this.prisma.artisanProfile.update({
        where: { userId },
        data: payload,
      });
    }

    return this.prisma.artisanProfile.create({
      data: {
        userId,
        ...payload,
      },
    });
  }

  async registerArtisan(userId: string, data: CreateArtisanProfileDto) {
    const slug = this.buildSlug(data.fullName);

    const existingBySlug = await this.prisma.artisanProfile.findUnique({
      where: { slug },
    });
    if (existingBySlug && existingBySlug.userId !== userId) {
      throw new Error('Slug đã tồn tại, vui lòng đổi tên khác');
    }

    const payload = {
      fullName: data.fullName,
      slug,
      description: data.description,
      expertise: data.expertise,
      location: data.location,
      avatarUrl: data.avatarUrl,
      cccdUrl: data.cccdUrl,
      isVerified: true, // Auto-accept as per user request
    };

    return this.prisma.$transaction(async (tx) => {
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
      const existingRole = await tx.userRole.findFirst({
        where: { userId, role: 'artisan' },
      });

      if (!existingRole) {
        await tx.userRole.create({
          data: { userId, role: 'artisan' },
        });
      }

      return profile;
    });
  }

  async getProfileBySlug(slug: string) {
    const profile = await this.prisma.artisanProfile.findUnique({
      where: { slug },
      include: {
        user: { select: { id: true, email: true, reputationScore: true } },
      },
    });
    if (!profile) {
      throw new NotFoundException('Không tìm thấy artisan');
    }
    return profile;
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.artisanProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Không tìm thấy artisan');
    }
    return profile;
  }
}
