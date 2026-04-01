import { Controller, Post, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Controller('upload')
export class UploadController {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  @Post('url')
  getUploadUrl(@Body() body: { folder?: string; publicId?: string }) {
    const { folder = 'artisans', publicId } = body;

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');

    if (!cloudName || !apiSecret || !apiKey) {
      throw new Error('Cloudinary configuration missing');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        public_id: publicId,
        upload_preset: 'artisan_profiles',
      },
      apiSecret,
    );

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    return {
      uploadUrl,
      timestamp,
      signature,
      apiKey,
      folder,
      publicId,
    };
  }
}
