// src/core/jobs/jobs.module.ts
import { Module } from '@nestjs/common';
import { UnactivatedUsersCleanupSchedulerService } from './unactivated-users-cleanup-scheduler.service';
import { RefreshTokenNoncesCleanupSchedulerService } from './refresh-token-nonces-cleanup-scheduler.service';
import { RefreshTokenNoncesModule } from 'src/core/refresh-token-nonces/refresh-token-nonces.module';
import { SoftDeletedFilesCleanupSchedulerService } from './soft-deleted-files-cleanup-scheduler.service';
import { UsersModule } from 'src/core/users/users.module';
import { FilesModule } from '../files/files.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { ExternalAccountsModule } from '../external-accounts/external-accounts.module';
import { GoogleAvatarsUpdateScheduler } from './google-avatars-update.scheduler';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
    imports: [
        RefreshTokenNoncesModule,
        UsersModule,
        FilesModule,
        FileUploadModule,
        ExternalAccountsModule,
        EncryptionModule
    ],
    providers: [
        UnactivatedUsersCleanupSchedulerService,
        RefreshTokenNoncesCleanupSchedulerService,
        SoftDeletedFilesCleanupSchedulerService,
        GoogleAvatarsUpdateScheduler,
    ],
})
export class JobsModule {}
