// src/core/jobs/soft-deleted-files-cleanup-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FilesService } from '../files/files.service';
import { FilePathService } from '../files/file-path.utils';
import { promises as fs } from 'fs';
import { JobsConstants } from './jobs.constants';

@Injectable()
export class SoftDeletedFilesCleanupSchedulerService {
    constructor(
        private readonly filesService: FilesService,
        private readonly filePathService: FilePathService,
    ) {}

    @Cron(JobsConstants.SOFT_DELETED_FILES_CLEANUP_FROM_DB_AND_STORAGE)
    async cleanupSoftDeletedFilesFromDbAndStorage() {
        try {
            const filesToDelete = await this.filesService.cleanupDeletedFiles();

            console.log(`Found ${filesToDelete.length} files to delete`);

            for (const file of filesToDelete) {
                try {
                    const filePath = this.filePathService.getFilePath(file);

                    await fs.unlink(filePath);

                    await this.filesService.hardDelete(file.id);

                    console.log(`Successfully deleted file: ${file.fileKey}`);
                } catch (error) {
                    console.error(
                        `Failed to delete file ${file.fileKey}: ${error.message}`,
                    );
                }
            }

            console.log('File cleanup job completed');
        } catch (error) {
            console.error(`File cleanup job failed: ${error.message}`);
        }
    }
}
