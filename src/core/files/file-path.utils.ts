// src/core/files/file-path.utils.ts
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { File } from '@prisma/client';

@Injectable()
export class FilePathService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('APP_URL') || 'http://localhost:8080'; //TODO: You need to see what's going on with the cofigs, maybe add APP_URL or you need to do it differently
  }

  getFileUrl(file: File): string {
    if (file.isDefault) {
      return `${this.baseUrl}/assets/defaults/${file.targetType.toLowerCase()}/${file.fileKey}.${file.extension}`;
    } else {
      return `${this.baseUrl}/api/files/download/${file.fileKey}`;
    }
  }

  getFilePath(file: File): string {
    if (file.isDefault) {
      return join(process.cwd(), 'public', 'assets', 'defaults', file.targetType.toLowerCase(), `${file.fileKey}.${file.extension}`);
    } else {
      return join(process.cwd(), 'storage', 'uploads', 'user_avatars', `${file.fileKey}.${file.extension}`);
    }
  }

  // Статический метод для использования без инъекции сервиса
  static getFilePathStatic(file: File, baseDir: string = process.cwd()): string {
    if (file.isDefault) {
      return join(baseDir, 'public', 'assets', 'defaults', file.targetType.toLowerCase(), `${file.fileKey}.${file.extension}`);
    } else {
      return join(baseDir, 'storage', 'uploads', file.targetType.toLowerCase(), `${file.fileKey}.${file.extension}`);
    }
  }
}
