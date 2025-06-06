// src/core/file-upload/file-upload.service.ts
import { Injectable, BadRequestException, StreamableFile } from '@nestjs/common';
import { createReadStream, promises as fs } from 'fs';
import { FilesService } from '../files/files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilePathsService } from '../files/file-paths.service';
import {
    ensureDirectoryExists,
    getFileExtension,
    buildFilePath,
    generateFileKey,
} from '../../common/utils';
import { File } from '../files/entities/file.entity';
import { Response as ExpressResponse } from 'express';

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

        const fileKey = fileMetadata.fileKey || generateFileKey();
        const fileExt = getFileExtension(file.originalname);
        const filename = `${fileKey}.${fileExt}`;

        const targetDir = this.filePathsService.getDirectoryPath(
            fileMetadata.targetType,
            fileMetadata.isDefault,
        );

        const filePath = buildFilePath(targetDir, filename);

        const savedFile = await this.filesService.create({
            ...(fileMetadata.authorId && { authorId: fileMetadata.authorId }),
            ...(fileMetadata.targetId && { targetId: fileMetadata.targetId }),
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

    async getFileStreamByFileKey(
        fileKey: string,
        res: ExpressResponse,
    ): Promise<StreamableFile> {
        const file = await this.filesService.findByFileKey(fileKey);

        const filePath = this.filePathsService.getFilePath(file);
        res.set({
            'Content-Type': file.mimeType,
            'Content-Disposition': `inline; filename="${file.fileKey}.${file.extension}"`,
        });
        const fileStream = createReadStream(filePath);
        return new StreamableFile(fileStream);
    }

    async hardDelete(file: File): Promise<void> {
        try {
            const filePath = this.filePathsService.getFilePath(file);

            await fs.unlink(filePath);

            await this.filesService.hardDelete(file.id);
        } catch (error) {
            console.error(
                `Failed to delete file ${file.fileKey}: ${error.message}`,
            );
        }
    }

    async hardDeleteMany(files: File[]): Promise<void> {
        await Promise.all(files.map((key) => this.hardDelete(key)));
    }
}
