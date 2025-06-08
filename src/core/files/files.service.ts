// src/core/files/files.service.ts
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { FileRepository } from './files.repository';
import { CreateFileDto } from './dto/create-file.dto';
import { File } from '@prisma/client';
import { createReadStream } from 'fs';
import { StreamableFile } from '@nestjs/common';
import { FilePathsService } from './file-paths.service';
import { Response as ExpressResponse } from 'express';
import { UpdateFileDto } from './dto/update-file.dto'
import { FileTargetType } from '@prisma/client';

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

    async findByFileKeyAndTargetType(
        fileKey: string,
        targetType: FileTargetType,
        targetId: number,
        includeSoftDeleted: boolean = false,
    ): Promise<File | null> {
        return this.fileRepository.findByFileKeyAndTargetType(
            fileKey,
            targetType,
            targetId,
            includeSoftDeleted,
        );
    }

    async findAllByAuthorId(
        authorId: number,
        includeSoftDeleted: boolean = false,
    ): Promise<File[]> {
        return this.fileRepository.findAllByAuthorId(
            authorId,
            includeSoftDeleted,
        );
    }

    async findAllByTargetId(
        targetId: number,
        includeSoftDeleted: boolean = false,
    ): Promise<File[]> {
        return this.fileRepository.findAllByTargetId(
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
        includeSoftDeleted: boolean = false,
    ): Promise<File> {
        const file = await this.fileRepository.findByFileKey(
            fileKey,
            includeSoftDeleted,
        );

        if (!file) {
            throw new NotFoundException(
                `File with key ${fileKey} not found or deleted`,
            );
        }

        return file;
    }

    async updateFile(id: number, updateFileDto: UpdateFileDto): Promise<File> {
        return this.fileRepository.update(id, updateFileDto)
    }

    async softDelete(id: number): Promise<void> {
        await this.findById(id);

        return this.fileRepository.softDelete(id);
    }

    async softDeleteMany(ids: number[]): Promise<void> {
        if (ids.length === 0) {
            throw new NotFoundException('No files found for the provided IDs');
        }

        await Promise.all(ids.map((id) => this.findById(id)));

        return this.fileRepository.softDeleteMany(ids);
    }

    async softDeleteByFileKey(
        fileKey: string,
        withTargetType: boolean = false,
    ): Promise<void> {
        const file = await this.findByFileKey(fileKey);

        if (withTargetType) {
            switch (file.targetType) {
                case FileTargetType.USER_AVATAR:
                case FileTargetType.FONT_ASSET:
                case FileTargetType.PROJECT_PREVIEW:
                case FileTargetType.PROJECT_ASSET:
                default: {
                    throw new ConflictException(
                        'Cannot delete file. Please use the specific delete method for this target type.',
                    );
                }

            }
        }

        return this.fileRepository.softDeleteByFileKey(fileKey);
    }

    async hardDelete(id: number): Promise<void> {
        await this.findById(id, true);
        await this.fileRepository.hardDelete(id);
    }

    async getDefaultFileUrlsByTargetType(
        targetType: FileTargetType,
        includeSoftDeleted: boolean = false,
    ): Promise<string[]> {
        if (!this.filePathsService.isValidTargetType(targetType)) {
            throw new BadRequestException(
                `Unsupported target type: ${targetType}`,
            );
        }
        const files = await this.findAllDefaultsByTargetType(
            targetType,
            includeSoftDeleted,
        );
        return files.map((f) => this.filePathsService.getFileUrl(f));
    }

    //TODO: Add restore functionality (not now)
}
