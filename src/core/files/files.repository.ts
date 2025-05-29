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

  async findById(id: number): Promise<File | null> {
    return this.db.file.findUnique({
      where: { id },
    });
  }

  async findByAuthorId(fileId: number, authorId: number): Promise<File | null> {
    return this.db.file.findUnique({
      where: { id: fileId, authorId: authorId },
    });
  }

  async findByFileKey(fileKey: string): Promise<File | null> {
    return this.db.file.findUnique({
      where: { fileKey },
    });
  }

  async update(id: number, data: any): Promise<File> {
    return this.db.file.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: number): Promise<File> {
    return this.db.file.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async softDeleteByFileKey(fileKey: string): Promise<File> {
    return this.db.file.update({
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

  async count(id: number): Promise<number> {
    return this.db.file.count({
      where: { id },
    });
  }

  async findDefaultByTargetType(targetType: FileTargetType): Promise<File[]> {
    return this.db.file.findMany({
      where: {
        targetType,
        deletedAt: null,
        isDefault: true
      },
    });
  }
}
