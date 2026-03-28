import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

export type UserWithRoles = User & { roles: UserRole[] };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async addRole(userId: string, role: string): Promise<UserRole> {
    return this.prisma.userRole.create({
      data: { userId, role },
    });
  }
}
