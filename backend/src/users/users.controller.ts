import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    const data = await this.usersService.getMeDetails(req.user.sub);
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
  ) {
    const data = await this.usersService.updateProfile(req.user.sub, body);
    return { message: 'Profile updated successfully', data };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow')
  async follow(
    @Req() req: AuthenticatedRequest,
    @Param('id') targetId: string,
  ) {
    const data = await this.usersService.followUser(req.user.sub, targetId);
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unfollow')
  async unfollow(
    @Req() req: AuthenticatedRequest,
    @Param('id') targetId: string,
  ) {
    const data = await this.usersService.unfollowUser(req.user.sub, targetId);
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/follow-status')
  async getFollowStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') targetId: string,
  ) {
    const data = await this.usersService.getFollowStatus(req.user.sub, targetId);
    return { data };
  }
}
