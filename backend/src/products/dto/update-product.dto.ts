import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsInt()
  @Min(0)
  version!: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsString()
  category_slug?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price_retail?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  price_wholesale?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({ require_tld: false }, { each: true })
  images?: string[];

  // Đặc thù Làng Nghề
  @IsOptional()
  @IsString()
  @MaxLength(200)
  material?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  origin?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  processingTime?: number;

  @IsOptional()
  @IsBoolean()
  isCustomizable?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isOneOfAKind?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
