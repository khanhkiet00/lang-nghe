import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListOrdersDto {
  @IsOptional()
  @IsIn([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'completed',
    'cancelled',
  ])
  status?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
