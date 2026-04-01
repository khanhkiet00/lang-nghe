import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  reviewee_id!: string;

  @IsUUID()
  order_id!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating_quality!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating_accuracy!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating_shipping!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating_communication!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating_payment!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  comment?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({ require_tld: false }, { each: true })
  images?: string[];
}
