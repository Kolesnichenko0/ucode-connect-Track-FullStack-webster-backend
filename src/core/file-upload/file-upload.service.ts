// src/core/file-upload/file-upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FilesService } from '../files/files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilePathService } from '../files/file-path.utils';
import { FileTargetType } from '@prisma/client';
import { ApiConfigService } from 'src/config/api-config.service';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly filesService: FilesService,
    private readonly filePathService: FilePathService,
    private readonly cs: ApiConfigService
  ) {
  }

  async upload(
    file: Express.Multer.File,
    fileMetadata: UploadFileDto
  ): Promise<{ fileId: number; url: string }> {
    const fileKey = uuidv4();
    const fileExt = path.extname(file.originalname).slice(1);
    const filename = `${fileKey}.${fileExt}`;

    const targetDir = (()=> {
      switch (fileMetadata.targetType) {
        case FileTargetType.USER_AVATAR:
          return this.cs.get('storage.paths.uploads.userAvatars')
        case FileTargetType.PROJECT_ASSET:
          return this.cs.get('storage.paths.uploads.projectAssets')
        case FileTargetType.PROJECT_PREVIEW:
          return this.cs.get('storage.paths.uploads.projectPreviews')
        case FileTargetType.FONT_ASSET:
          return this.cs.get('storage.paths.uploads.fontAssets')
        default:
          return this.cs.get('storage.paths.uploads.others')
      }
    }) ();

    const filePath = path.join(targetDir, filename);

    const savedFile = await this.filesService.create({
      ...(fileMetadata.authorId && {authorId: fileMetadata.authorId}),
      ...(fileMetadata.targetId && {authorId: fileMetadata.targetId}),
      targetType: fileMetadata.targetType,
      fileKey: fileKey,
      mimeType: file.mimetype,
      extension: fileExt,
      isDefault: fileMetadata.isDefault,
    });

    await this.ensureDirectoryExists(targetDir);
    await fs.writeFile(filePath, file.buffer);

    return {
      fileId: savedFile.id,
      url: this.filePathService.getFileUrl(savedFile),
    };
  }

  async uploadMany(
    files: Express.Multer.File[],
    fileMetadata: UploadFileDto,
  ): Promise<Array<{ fileId: number; url: string }>> {
    return Promise.all(files.map(file => this.upload(file, fileMetadata)));
  }

  async delete(fileKey: string, targetType: string): Promise<void> {
    try {
      await this.filesService.deleteByFileKey(fileKey);

    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  async deleteMany(fileKeys: string[], targetType: string): Promise<void> {
    await Promise.all(fileKeys.map(key => this.delete(key, targetType)));
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }


}
