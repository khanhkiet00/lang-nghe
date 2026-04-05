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

export class CreateProductDto {
  @IsString()
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsString()
  category_slug!: string;

  @IsInt()
  @Min(0)
  price_retail!: number;

  @IsInt()
  @Min(0)
  price_wholesale!: number;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  images?: string[];

  // Đặc thù Làng Nghề
  @IsOptional()
  @IsString()
  @MaxLength(200)
  material?: string; // "Gốm men lam", "Lụa tơ tằm"

  @IsOptional()
  @IsString()
  @MaxLength(300)
  origin?: string; // "Làng Bát Tràng, Gia Lâm, Hà Nội"

  @IsOptional()
  @IsInt()
  @Min(1)
  processingTime?: number; // Thời gian chế tác (ngày)

  @IsOptional()
  @IsBoolean()
  isCustomizable?: boolean; // Nhận đặt theo yêu cầu

  @IsOptional()
  @IsInt()
  @Min(0)
  weight?: number; // Gram

  @IsOptional()
  @IsBoolean()
  isOneOfAKind?: boolean; // Hàng độc bản
}
