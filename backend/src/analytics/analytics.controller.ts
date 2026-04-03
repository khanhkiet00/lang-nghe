import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('buyer')
  async getBuyerAnalytics(
    @Request() req,
    @Query('timeFilter') timeFilter: 'month' | 'quarter' | 'year' = 'month',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAnalytics(
      req.user.sub,
      'buyer',
      timeFilter,
      startDate,
      endDate,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('artisan')
  async getArtisanAnalytics(
    @Request() req,
    @Query('timeFilter') timeFilter: 'month' | 'quarter' | 'year' = 'month',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!req.user.roles.includes('artisan')) {
      throw new BadRequestException(
        'Bạn không có quyền xem thống kê của xưởng',
      );
    }
    return this.analyticsService.getAnalytics(
      req.user.sub,
      'artisan',
      timeFilter,
      startDate,
      endDate,
    );
  }
}
