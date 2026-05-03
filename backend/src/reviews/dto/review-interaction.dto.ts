import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReactToReviewDto {
  @IsIn(['like', 'dislike'])
  value!: 'like' | 'dislike';
}

export class ReplyToReviewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content!: string;
}
