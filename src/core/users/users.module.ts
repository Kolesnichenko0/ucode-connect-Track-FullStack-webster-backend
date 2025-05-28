// src/core/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { HashingPasswordsService } from './hashing-passwords.service';
import { AccountOwnerGuard } from './guards/account-owner.guard';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { HashingModule } from '../hashing/hashing.module';
import { FileUploadService } from '../file-upload/file-upload.service';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { FilesModule } from '../files/files.module';

@Module({
    imports: [EmailModule, forwardRef(() => AuthModule), HashingModule, FileUploadModule, FilesModule],
    controllers: [UsersController],
    providers: [
        UsersService,
        UsersRepository,
        HashingPasswordsService,
        AccountOwnerGuard,
    ],
    exports: [UsersService, UsersRepository, HashingPasswordsService, AccountOwnerGuard],
})
export class UsersModule { }
