// src/core/core.module.ts
import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './db/database.module';
import { EmailModule } from './email/email.module';
import { RefreshTokenNoncesModule } from './refresh-token-nonces/refresh-token-nonces.module';
import { JobsModule } from './jobs/jobs.module';
import { JwtModule } from './jwt/jwt.module';
import { HashingModule } from './hashing/hashing.module';
import { FilesModule } from './files/files.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { UnsplashModule } from './unsplash/unsplash.module';
import { GoogleAuthModule } from './auth/google/google-auth.module';
import { ExternalAccountsModule } from './external-accounts/external-accounts.module';

@Module({
    imports: [
        AuthModule,
        GoogleAuthModule,
        DatabaseModule,
        EmailModule,
        FilesModule,
        FileUploadModule,
        HashingModule,
        JobsModule,
        JwtModule,
        RefreshTokenNoncesModule,
        UsersModule,
        UnsplashModule,
        ExternalAccountsModule,
    ],
})
export class CoreModule { }
