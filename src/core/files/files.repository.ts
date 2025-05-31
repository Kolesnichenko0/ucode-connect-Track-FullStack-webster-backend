// src/core/files/files.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { CreateFileDto } from './dto/create-file.dto';
import { File, FileTargetType } from '@prisma/client';

@Injectable()
export class FileRepository {
    constructor(private db: DatabaseService) {}

    async create(data: CreateFileDto): Promise<File> {
        return this.db.file.create({
            data,
        });
    }

    async findAllSoftDeletedByDeletedAt(deletedBefore: Date): Promise<File[]> {
        return this.db.file.findMany({
            where: {
                deletedAt: { lt: deletedBefore },
                isDefault: false,
            },
            orderBy: { deletedAt: 'desc' },
        });
    }

    async findAllDefaultsByTargetType(
        targetType: FileTargetType,
        includeSoftDeleted: boolean = false,
    ): Promise<File[]> {
        return this.db.file.findMany({
            where: {
                targetType,
                ...(includeSoftDeleted ? {} : { deletedAt: null }),
                isDefault: true,
            },
        });
    }

    async findAllByTargetTypeAndTargetId(
        targetType: FileTargetType,
        targetId: number,
        includeSoftDeleted: boolean = false,
    ): Promise<File[]> {
        return this.db.file.findMany({
            where: {
                targetType,
                targetId,
                ...(includeSoftDeleted ? {} : { deletedAt: null }),
            },
        });
    }

    async findAllByAuthorId(
        authorId: number,
        includeSoftDeleted: boolean = false,
    ): Promise<File[]> {
        return this.db.file.findMany({
            where: {
                authorId,
                ...(includeSoftDeleted ? {} : { deletedAt: null }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(
        id: number,
        includeSoftDeleted: boolean = false,
    ): Promise<File | null> {
        return this.db.file.findUnique({
            where: {
                id,
                ...(includeSoftDeleted ? {} : { deletedAt: null }),
            },
        });
    }

    async findByFileKey(
        fileKey: string,
        includeSoftDeleted: boolean = false,
    ): Promise<File | null> {
        return this.db.file.findUnique({
            where: {
                fileKey,
                ...(includeSoftDeleted ? {} : { deletedAt: null }),
            },
        });
    }

    async update(id: number, data: any): Promise<File> {
        return this.db.file.update({
            where: { id },
            data,
        });
    }

    async softDelete(id: number): Promise<void> {
        await this.db.file.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async softDeleteMany(ids: number[]): Promise<void> {
        await this.db.file.updateMany({
            where: {
                id: { in: ids },
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async softDeleteByFileKey(fileKey: string): Promise<void> {
        await this.db.file.update({
            where: { fileKey },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async hardDelete(id: number): Promise<void> {
        await this.db.file.delete({
            where: { id },
        });
    }

    async count(
        id: number,
        includeSoftDeleted: boolean = false,
    ): Promise<number> {
        return this.db.file.count({
            where: {
                id,
                ...(includeSoftDeleted ? {} : { deletedAt: null }),
            },
        });
    }
}
