import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['confirmed', 'processing', 'shipped', 'completed', 'cancelled'])
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancelReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingProvider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  noteFromArtisan?: string;
}
