// src/core/users/users.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { HashingPasswordsService } from './hashing-passwords.service';
import { AccountOwnerGuard } from './guards/account-owner.guard';
import { EmailModule } from '../email/email.module';
import { HashingModule } from '../hashing/hashing.module';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { FilesModule } from '../files/files.module';
import { ProjectsModule } from 'src/modules/projects/projects.module';
import { ExternalAccountsModule } from '../external-accounts/external-accounts.module';

@Module({
    imports: [
        EmailModule,
        HashingModule,
        FileUploadModule,
        FilesModule,
        ProjectsModule,
        forwardRef(() => ExternalAccountsModule),
    ],
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
