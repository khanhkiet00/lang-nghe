import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  display_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  village?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  avatar_url?: string;
}
