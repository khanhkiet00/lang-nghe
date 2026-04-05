import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

export const storage = diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.originalname.split('.')[0]}-${uniqueSuffix}${ext}`);
  },
});

@Controller('upload')
export class UploadController {
  @Post('')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urls = files.map((file) => `/uploads/${file.filename}`);
    return { urls };
  }
}
