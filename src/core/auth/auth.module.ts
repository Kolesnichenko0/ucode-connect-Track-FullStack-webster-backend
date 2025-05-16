// src/core/auth/auth.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtResetPasswordStrategy } from './strategies/jwt-reset-password.strategy';
import { JwtConfirmEmailStrategy } from './strategies/jwt-confirm-email.strategy';
import { UsersModule } from '../users/users.module';
import { RefreshTokenNoncesModule } from 'src/core/refresh-token-nonces/refresh-token-nonces.module';
import {
    JwtAuthGuard,
    JwtRefreshGuard,
    JwtResetPasswordGuard,
    JwtConfirmEmailGuard,
} from 'src/core/auth/guards/auth.guards';
import { EmailModule } from 'src/core/email/email.module';
import { JwtModule } from 'src/core/jwt/jwt.module';
import { APP_GUARD } from '@nestjs/core';
@Module({
    imports: [
        forwardRef(() => UsersModule),
        EmailModule,
        RefreshTokenNoncesModule,
        JwtModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtAccessStrategy,
        JwtResetPasswordStrategy,
        JwtConfirmEmailStrategy,
        JwtRefreshStrategy,
        JwtAuthGuard,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        JwtRefreshGuard,
        JwtResetPasswordGuard,
        JwtConfirmEmailGuard,
    ],
    exports: [AuthService],
})
export class AuthModule { }
