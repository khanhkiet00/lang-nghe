import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
const FormData = require('form-data');
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EkycService {
  constructor(private readonly configService: ConfigService) {}

  private getFptApiKey(): string {
    const key = this.configService.get<string>('FPT_AI_API_KEY');
    if (!key) {
      throw new InternalServerErrorException(
        'Lỗi kỹ thuật: Chưa thiết lập mã FPT_AI_API_KEY trên Server. Vui lòng liên hệ Admin.',
      );
    }
    return key;
  }

  async ocrCccd(imageBuffer: Buffer, fileName: string, mimetype: string) {
    const apiKey = this.getFptApiKey();

    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: fileName,
      contentType: mimetype,
    });

    try {
      const response = await axios.post(
        'https://api.fpt.ai/vision/idr/vnm',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'api-key': apiKey,
          },
        },
      );

      const data = response.data;
      fs.writeFileSync(
        path.join(process.cwd(), 'fpt_ocr_log.txt'),
        JSON.stringify(data, null, 2),
      );

      if (data.errorCode !== 0) {
        throw new HttpException(data.errorMessage || 'Lỗi từ FPT API', 400);
      }

      return data.data[0];
    } catch (error: any) {
      const errorData = error.response ? error.response.data : error.message;
      fs.writeFileSync(
        path.join(process.cwd(), 'fpt_ocr_error.txt'),
        JSON.stringify(errorData, null, 2),
      );

      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Lỗi khi gọi FPT API',
      );
    }
  }

  async faceMatch(
    file1Buffer: Buffer,
    file1Name: string,
    file1Mime: string,
    file2Buffer: Buffer,
    file2Name: string,
    file2Mime: string,
  ) {
    const apiKey = this.getFptApiKey();

    const formData = new FormData();
    formData.append('file[]', file1Buffer, {
      filename: file1Name,
      contentType: file1Mime,
    });
    formData.append('file[]', file2Buffer, {
      filename: file2Name,
      contentType: file2Mime,
    });

    try {
      const response = await axios.post(
        'https://api.fpt.ai/dmp/checkface/v1',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'api-key': apiKey,
          },
        },
      );

      const data = response.data;
      fs.writeFileSync(
        path.join(process.cwd(), 'fpt_face_log.txt'),
        JSON.stringify(data, null, 2),
      );

      if (data.code !== '200') {
        throw new HttpException(
          data.message || 'Lỗi khớp khuôn mặt từ FPT API',
          400,
        );
      }

      return data.data;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error.message || 'Lỗi khi gọi FPT FaceMatch API',
      );
    }
  }
}
