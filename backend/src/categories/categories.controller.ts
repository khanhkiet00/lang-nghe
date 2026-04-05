import {
  Controller,
  Get,
  Post,
  Body,
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import slugify from 'slugify';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
    return { data: categories };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateCategoryDto) {
    const slug = slugify(dto.name, { lower: true, strict: true, trim: true });

    // Check if category with this slug already exists
    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return { data: existing }; // If exists, return the existing one (idempotent for UX)
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
      },
    });

    return { data: category };
  }
}
