import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
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
  async listByReviewee(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.reviewsService.listReviewsForUser(id);
    return { data };
  }
}
