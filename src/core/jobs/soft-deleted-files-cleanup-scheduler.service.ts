// src/core/jobs/soft-deleted-files-cleanup-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FilesService } from '../files/files.service';
import { FilePathsService } from '../files/file-paths.service';
import { JobsConstants } from './jobs.constants';
import { FileUploadService } from '../file-upload/file-upload.service';

@Injectable()
export class SoftDeletedFilesCleanupSchedulerService {
    private static readonly SOFT_DELETE_RETENTION_PERIOD_MILLISECONDS =
        24 * 60 * 60 * 1000;

    constructor(
        private readonly filesService: FilesService,
        private readonly fileUploadService: FileUploadService,
    ) {}

    @Cron(JobsConstants.SOFT_DELETED_FILES_CLEANUP_FROM_DB_AND_STORAGE)
    async cleanupSoftDeletedFilesFromDbAndStorage() {
        try {
            const deletedBefore = new Date(
                Date.now() -
                    SoftDeletedFilesCleanupSchedulerService.SOFT_DELETE_RETENTION_PERIOD_MILLISECONDS,
            );

            const filesToDelete =
                await this.filesService.findAllSoftDeletedByDeletedAt(
                    deletedBefore,
                );

            console.log(`Found ${filesToDelete.length} files to delete`);

            await this.fileUploadService.hardDeleteMany(filesToDelete);

            console.log('File cleanup job completed');
        } catch (error) {
            console.error(`File cleanup job failed: ${error.message}`);
        }
    }
}
