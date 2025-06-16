// src/core/auth/google/google-auth.module.ts
import { Module } from '@nestjs/common';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleAuthService } from './google-auth.service';
import { GoogleAuthStrategy } from './strategies/google-auth.strategy';
import { UsersModule } from '../../users/users.module';
import { ExternalAccountsModule } from '../../external-accounts/external-accounts.module';
import { AuthModule } from '../auth.module';

@Module({
    imports: [
        UsersModule,
        ExternalAccountsModule,
        AuthModule,
    ],
    controllers: [GoogleAuthController],
    providers: [GoogleAuthService, GoogleAuthStrategy],
})
export class GoogleAuthModule {}
