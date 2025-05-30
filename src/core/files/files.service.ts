// src/core/files/files.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FileTargetType } from '@prisma/client';
import { FileRepository } from './files.repository';
import { CreateFileDto } from './dto/create-file.dto';
import { File } from '@prisma/client';
import { createReadStream } from 'fs';
import { StreamableFile } from '@nestjs/common';
import { FilePathsService } from './file-paths.service';
import { Response as ExpressResponse } from 'express';

@Injectable()
export class FilesService {
    constructor(
        private readonly fileRepository: FileRepository,
        private readonly filePathsService: FilePathsService,
    ) {}

    async create(createFileDto: CreateFileDto): Promise<File> {
        return this.fileRepository.create(createFileDto);
    }

    async findAllSoftDeletedByDeletedAt(deletedBefore: Date): Promise<File[]> {
        return this.fileRepository.findAllSoftDeletedByDeletedAt(deletedBefore);
    }

    async findAllDefaultsByTargetType(
        targetType: FileTargetType,
        includeSoftDeleted: boolean = false,
    ): Promise<File[]> {
        return this.fileRepository.findAllDefaultsByTargetType(
            targetType,
            includeSoftDeleted,
        );
    }

    async findAllByTargetTypeAndTargetId(
        targetType: FileTargetType,
        targetId: number,
        includeSoftDeleted: boolean = false,
    ): Promise<File[]> {
        return this.fileRepository.findAllByTargetTypeAndTargetId(
            targetType,
            targetId,
            includeSoftDeleted,
        );
    }

    async findById(
        id: number,
        includeSoftDeleted: boolean = false,
    ): Promise<File> {
        const file = await this.fileRepository.findById(id, includeSoftDeleted);

        if (!file) {
            throw new NotFoundException(
                `File with ID ${id} not found or deleted`,
            );
        }

        return file;
    }

    async findByFileKey(
        fileKey: string,
        includeSoftDeleted: boolean = false
    ): Promise<File> {
        const file = await this.fileRepository.findByFileKey(fileKey, includeSoftDeleted);

        if (!file) {
            throw new NotFoundException(
                `File with key ${fileKey} not found or deleted`,
            );
        }

        return file;
    }

    async softDelete(id: number): Promise<void> {
        await this.findById(id);

        return this.fileRepository.softDelete(id);
    }

    async softDeleteByFileKey(fileKey: string): Promise<void> {
        await this.findByFileKey(fileKey);

        return this.fileRepository.softDeleteByFileKey(fileKey);
    }

    async hardDelete(id: number): Promise<void> {
        await this.findById(id, true);
        await this.fileRepository.hardDelete(id);
    }

    async getFileStreamByFileKey(
        fileKey: string,
        res: ExpressResponse
    ): Promise<StreamableFile> {
        const file = await this.findByFileKey(fileKey);

        if (!file) {
            throw new NotFoundException(`File with ${fileKey} not found!`);
        }

        const filePath = this.filePathsService.getFilePath(file);
        res.set({
            'Content-Type': file.mimeType,
            'Content-Disposition': `inline; filename="${file.fileKey}.${file.extension}"`,
        });
        const fileStream = createReadStream(filePath);
        return new StreamableFile(fileStream);
    }

    async getDefaultFileUrlsByTargetType(
        targetType: FileTargetType,
        includeSoftDeleted: boolean = false,
    ): Promise<string[]> {
        if (!this.filePathsService.isValidTargetType(targetType)) {
            throw new BadRequestException(`Unsupported target type: ${targetType}`);
        }
        const files = await this.findAllDefaultsByTargetType(targetType, includeSoftDeleted);
        return files.map((f) => this.filePathsService.getFileUrl(f));
    }

    //TODO: Add restore functionality (not now)
}
