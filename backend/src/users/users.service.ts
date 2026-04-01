import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
import slugify from 'slugify';
import { UpdateProfileDto } from './dto/update-profile.dto';

export type UserWithRoles = User & { roles: UserRole[] };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
        profile: true,
        products: {
          where: { isActive: true },
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

    return user;
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
}
