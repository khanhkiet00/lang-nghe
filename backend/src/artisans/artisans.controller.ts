import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ArtisansService } from './artisans.service';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('artisans')
export class ArtisansController {
  constructor(private readonly artisansService: ArtisansService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('artisan')
  @Post('me')
  async createOrUpdateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateArtisanProfileDto,
  ) {
    const userId = req.user.sub;
    return this.artisansService.createOrUpdateProfile(userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.artisansService.getProfileByUserId(userId);
  }

  @Get(':slug')
  async getProfileBySlug(@Param('slug') slug: string) {
    return this.artisansService.getProfileBySlug(slug);
  }
}
