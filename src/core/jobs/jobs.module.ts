// src/jobs/jobs.module.ts
import { Module } from '@nestjs/common';
import { UnactivatedUsersCleanupSchedulerService } from './unactivated-users-cleanup-scheduler.service';
import { RefreshTokenNoncesCleanupSchedulerService } from './refresh-token-nonces-cleanup-scheduler.service';
import { RefreshTokenNoncesModule } from 'src/core/refresh-token-nonces/refresh-token-nonces.module';
import { SoftDeletedFilesCleanupSchedulerService } from './soft-deleted-files-cleanup-scheduler.service';
import { UsersModule } from 'src/core/users/users.module';
import { FilesModule } from '../files/files.module';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
    imports: [RefreshTokenNoncesModule, UsersModule, FilesModule, FileUploadModule],
    providers: [
        UnactivatedUsersCleanupSchedulerService,
        RefreshTokenNoncesCleanupSchedulerService,
        SoftDeletedFilesCleanupSchedulerService,
    ],
})
export class JobsModule { }
