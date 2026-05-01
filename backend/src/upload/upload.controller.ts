import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const FOLDER_BY_TYPE: Record<string, string> = {
  products: 'langnghe/products',
  avatars: 'langnghe/users/avatars',
  artisans: 'langnghe/artisans',
  reviews: 'langnghe/reviews',
  ekyc: 'langnghe/ekyc',
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadBufferToCloudinary(
  file: Express.Multer.File,
  folder: string,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary did not return an upload result'));
          return;
        }
        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post('')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
          cb(
            new BadRequestException(
              'Chi ho tro anh JPG, PNG hoac WEBP',
            ) as unknown as Error,
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadFiles(
    @Req() req: AuthenticatedRequest,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folderType') folderType = 'products',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const baseFolder = FOLDER_BY_TYPE[folderType];
    if (!baseFolder) {
      throw new BadRequestException('Loai thu muc upload khong hop le');
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new BadRequestException('Cloudinary chua duoc cau hinh');
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const folder = `${baseFolder}/${req.user.sub}`;
    const uploadedFiles = await Promise.all(
      files.map((file) => uploadBufferToCloudinary(file, folder)),
    );

    const result = uploadedFiles.map((file) => ({
      url: file.secure_url,
      publicId: file.public_id,
      width: file.width,
      height: file.height,
      bytes: file.bytes,
      format: file.format,
    }));

    return {
      urls: result.map((file) => file.url),
      publicIds: result.map((file) => file.publicId),
      files: result,
    };
  }
}
