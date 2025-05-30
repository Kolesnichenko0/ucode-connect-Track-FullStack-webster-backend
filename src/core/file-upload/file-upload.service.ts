// src/core/file-upload/file-upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FilesService } from '../files/files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilePathsService } from '../files/file-paths.service';

@Injectable()
export class FileUploadService {
    constructor(
        private readonly filesService: FilesService,
        private readonly filePathsService: FilePathsService,
    ) {}

    async upload(
        file: Express.Multer.File,
        fileMetadata: UploadFileDto,
    ): Promise<{ fileId: number; url: string }> {
        if (!this.filePathsService.isValidTargetType(fileMetadata.targetType)) {
            throw new BadRequestException(
                `Unsupported file target type: ${fileMetadata.targetType}`,
            );
        }

        const fileKey = uuidv4();
        const fileExt = path.extname(file.originalname).slice(1);
        const filename = `${fileKey}.${fileExt}`;

        const targetDir = this.filePathsService.getDirectoryPath(
            fileMetadata.targetType,
            false,
        );

        const filePath = path.join(targetDir, filename);

        const savedFile = await this.filesService.create({
            ...(fileMetadata.authorId && { authorId: fileMetadata.authorId }),
            ...(fileMetadata.targetId && { authorId: fileMetadata.targetId }),
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
            url: this.filePathsService.getFileUrl(savedFile),
        };
    }

    async uploadMany(
        files: Express.Multer.File[],
        fileMetadata: UploadFileDto,
    ): Promise<Array<{ fileId: number; url: string }>> {
        return Promise.all(
            files.map((file) => this.upload(file, fileMetadata)),
        );
    }

    async delete(fileKey: string): Promise<void> {
        await this.filesService.softDeleteByFileKey(fileKey);
    }

    async deleteMany(fileKeys: string[]): Promise<void> {
        await Promise.all(fileKeys.map((key) => this.delete(key)));
    }

    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }
}
