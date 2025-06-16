// src/core/external-accounts/external-accounts.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ExternalAccountsService } from './external-accounts.service';
import { ExternalAccountsRepository } from './external-accounts.repository';
import { UsersModule } from '../users/users.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
    imports: [
        EncryptionModule,
        forwardRef(() => UsersModule),
    ],
    providers: [ExternalAccountsService, ExternalAccountsRepository],
    exports: [ExternalAccountsService],
})
export class ExternalAccountsModule {}
