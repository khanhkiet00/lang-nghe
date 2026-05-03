import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReactToReviewDto, ReplyToReviewDto } from './dto/review-interaction.dto';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reviews')
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateReviewDto,
  ) {
    const data = await this.reviewsService.createReview(req.user.sub, body);
    return { message: 'Review created successfully', data };
  }

  @Get('users/:id/reviews')
  async listByReviewee(@Param('id') id: string) {
    const data = await this.reviewsService.listReviewsForUser(id);
    return { data };
  }

  @Get('products/:id/reviews')
  async listByProduct(@Param('id') id: string) {
    const data = await this.reviewsService.listProductReviews(id);
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reviews/:id/reaction')
  async reactToArtisanReview(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: ReactToReviewDto,
  ) {
    const data = await this.reviewsService.reactToReview(
      req.user.sub,
      'artisan',
      id,
      body,
    );
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('product-reviews/:id/reaction')
  async reactToProductReview(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: ReactToReviewDto,
  ) {
    const data = await this.reviewsService.reactToReview(
      req.user.sub,
      'product',
      id,
      body,
    );
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reviews/:id/replies')
  async replyToArtisanReview(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: ReplyToReviewDto,
  ) {
    const data = await this.reviewsService.replyToReview(
      req.user.sub,
      'artisan',
      id,
      body,
    );
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('product-reviews/:id/replies')
  async replyToProductReview(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: ReplyToReviewDto,
  ) {
    const data = await this.reviewsService.replyToReview(
      req.user.sub,
      'product',
      id,
      body,
    );
    return { data };
  }
}
