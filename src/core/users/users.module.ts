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

@Module({
    imports: [EmailModule, forwardRef(() => AuthModule), HashingModule],
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
