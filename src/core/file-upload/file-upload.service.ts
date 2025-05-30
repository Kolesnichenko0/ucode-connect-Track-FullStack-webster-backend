// src/core/file-upload/file-upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { FilesService } from '../files/files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilePathsService } from '../files/file-paths.service';
import {
    ensureDirectoryExists,
    getFileExtension,
    buildFilePath, generateFileKey,
} from '../../common/utils';

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

        const fileKey = generateFileKey();
        const fileExt = getFileExtension(file.originalname);
        const filename = `${fileKey}.${fileExt}`;

        const targetDir = this.filePathsService.getDirectoryPath(
            fileMetadata.targetType,
            false,
        );

        const filePath = buildFilePath(targetDir, filename);

        const savedFile = await this.filesService.create({
            ...(fileMetadata.authorId && { authorId: fileMetadata.authorId }),
            ...(fileMetadata.targetId && { authorId: fileMetadata.targetId }),
            targetType: fileMetadata.targetType,
            fileKey: fileKey,
            mimeType: file.mimetype,
            extension: fileExt,
            isDefault: fileMetadata.isDefault,
        });

        await ensureDirectoryExists(targetDir);
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
}
