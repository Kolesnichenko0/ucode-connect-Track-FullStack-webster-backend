// src/core/files/file-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FilesService } from '../files.service';
import { FilePathService } from '../file-path.utils';
import { promises as fs } from 'fs';

@Injectable()
export class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name);

  constructor(
    private readonly filesService: FilesService,
    private readonly filePathService: FilePathService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupDeletedFiles() {
    this.logger.log('Starting file cleanup job');
    
    try {
      const filesToDelete = await this.filesService.cleanupDeletedFiles();
      
      this.logger.log(`Found ${filesToDelete.length} files to delete`);
      
      for (const file of filesToDelete) {
        try {
          const filePath = this.filePathService.getFilePath(file);
          
          await fs.unlink(filePath);
          
          await this.filesService.hardDelete(file.id);
          
          this.logger.log(`Successfully deleted file: ${file.fileKey}`);
        } catch (error) {
          this.logger.error(`Failed to delete file ${file.fileKey}: ${error.message}`);
        }
      }
      
      this.logger.log('File cleanup job completed');
    } catch (error) {
      this.logger.error(`File cleanup job failed: ${error.message}`);
    }
  }
}
