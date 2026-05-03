import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductReviewDto {
  @IsString()
  product_id!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

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

export class CreateReviewDto {
  @IsString()
  reviewee_id!: string;

  @IsString()
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductReviewDto)
  product_reviews?: CreateProductReviewDto[];
}
