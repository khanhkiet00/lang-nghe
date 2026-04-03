import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateArtisanProfileDto {
  @IsNotEmpty({ message: 'Tên / Nghệ danh không được để trống' })
  @IsString()
  @MinLength(2, { message: 'Tên phải chứa ít nhất 2 ký tự' })
  fullName: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString()
  @Matches(/^(0[3|5|7|8|9])+([0-9]{8})\b/, {
    message:
      'Số điện thoại không hợp lệ (Phải là SDT Việt Nam 10 số, bắt đầu bằng 03, 05, 07, 08, 09)',
  })
  phone: string;

  @IsNotEmpty({ message: 'Lĩnh vực chuyên môn không được để trống' })
  @IsString()
  @MinLength(2, { message: 'Lĩnh vực chuyên môn quá ngắn' })
  expertise: string;

  @IsNotEmpty({ message: 'Khu vực làm việc không được để trống' })
  @IsString()
  @MinLength(2, { message: 'Địa chỉ khu vực quá ngắn' })
  location: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  cccdUrl?: string;
}
