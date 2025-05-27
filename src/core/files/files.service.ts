// src/core/files/files.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TargetType } from '@prisma/client';
import { FileRepository } from './files.repository';
import { CreateFileDto, UpdateFileDto } from './dto';
import { File } from '@prisma/client';
import { createReadStream } from 'fs';
import { StreamableFile, Response } from '@nestjs/common';
import { FilePathService } from './file-path.utils';
import { Response as ExpressResponse } from 'express';

@Injectable()
export class FilesService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly filePathService: FilePathService,
  ) { }

  async create(createFileDto: CreateFileDto): Promise<File> {
    return this.fileRepository.create(createFileDto);
  }

  async findById(id: number): Promise<File> {
    const file = await this.fileRepository.findById(id);

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async findByFileKey(fileKey: string): Promise<File> {
    const file = await this.fileRepository.findByFileKey(fileKey);

    if (!file) {
      throw new NotFoundException(`File with key ${fileKey} not found`);
    }

    return file;
  }

  async update(id: number, updateFileDto: UpdateFileDto): Promise<File> {
    await this.findById(id);
    return this.fileRepository.update(id, updateFileDto);
  }

  async softDelete(id: number): Promise<File> {
    await this.findById(id);

    return this.fileRepository.softDelete(id);
  }

  async softDeleteByFileKey(fileKey: string): Promise<File> {
    await this.findByFileKey(fileKey);

    return this.fileRepository.softDeleteByFileKey(fileKey);
  }

  async hardDelete(id: number): Promise<void> {
    const file = await this.findById(id);

    if (file.isDefault) {
      throw new ForbiddenException('Default files cannot be deleted');
    }

    await this.fileRepository.hardDelete(id);
  }

  async deleteByFileKey(fileKey: string): Promise<void> {
    const file = await this.findByFileKey(fileKey);

    if (file.isDefault) {
      throw new ForbiddenException('Default files cannot be deleted');
    }

    await this.fileRepository.softDelete(file.id);
  }

  // async exists(id: number): Promise<boolean> {
  //   const count = await this.fileRepository.count(id);
  //   return count > 0;
  // }

  async checkUserHasAccessToFile(fileId: number, userId: number): Promise<boolean> {
    const file = await this.fileRepository.findByAuthorId(fileId, userId);

    return file ? true : false;
  }

  async cleanupDeletedFiles(olderThan: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)): Promise<File[]> {
    return this.fileRepository.findFilesToCleanup(olderThan);
  }

  async getFileStreamByKey(fileKey: string, res: ExpressResponse): Promise<StreamableFile> {
    const file = await this.findByFileKey(fileKey);

    if (!file) {
      throw new NotFoundException(`File with ${fileKey} not found!`)
    }

    const filePath = this.filePathService.getFilePath(file);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `inline; filename="${file.fileKey}.${file.extension}"`,
    });
    const fileStream = createReadStream(filePath);
    return new StreamableFile(fileStream);
  }



  async getDefaultFileUrlsByTargetType(targetType: TargetType): Promise<string[]> {
    const files = await this.fileRepository.findDefaultByTargetType(targetType);
    return files.map(f => this.filePathService.getFileUrl(f));
  }
}
