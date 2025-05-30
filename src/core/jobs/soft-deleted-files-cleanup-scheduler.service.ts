// src/core/jobs/soft-deleted-files-cleanup-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FilesService } from '../files/files.service';
import { FilePathsService } from '../files/file-paths.service';
import { promises as fs } from 'fs';
import { JobsConstants } from './jobs.constants';

@Injectable()
export class SoftDeletedFilesCleanupSchedulerService {
    private static readonly SOFT_DELETE_RETENTION_PERIOD_MILLISECONDS = 24 * 60 * 60 * 1000;

    constructor(
        private readonly filesService: FilesService,
        private readonly filePathsService: FilePathsService,
    ) {}

    @Cron(JobsConstants.SOFT_DELETED_FILES_CLEANUP_FROM_DB_AND_STORAGE)
    async cleanupSoftDeletedFilesFromDbAndStorage() {
        try {
            const deletedBefore = new Date(Date.now() - SoftDeletedFilesCleanupSchedulerService.SOFT_DELETE_RETENTION_PERIOD_MILLISECONDS);

            const filesToDelete = await this.filesService.findAllSoftDeletedByDeletedAt(deletedBefore);

            console.log(`Found ${filesToDelete.length} files to delete`);

            for (const file of filesToDelete) {
                try {
                    const filePath = this.filePathsService.getFilePath(file);

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
