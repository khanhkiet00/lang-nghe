import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { EkycService } from './ekyc.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ekyc')
@UseGuards(AuthGuard('jwt'))
export class EkycController {
  constructor(private readonly ekycService: EkycService) {}

  @Post('ocr')
  @UseInterceptors(FileInterceptor('image'))
  async ocrCccd(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload ảnh CCCD');
    }
    return this.ekycService.ocrCccd(file.buffer, file.originalname, file.mimetype);
  }

  @Post('face-match')
  @UseInterceptors(FilesInterceptor('files', 2))
  async faceMatch(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length !== 2) {
      throw new BadRequestException(
        'Vui lòng upload đúng 2 ảnh (CCCD và Selfie)',
      );
    }
    return this.ekycService.faceMatch(
      files[0].buffer,
      files[0].originalname,
      files[0].mimetype,
      files[1].buffer,
      files[1].originalname,
      files[1].mimetype,
    );
  }
}
