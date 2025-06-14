// src/core/auth/guards/auth.guards.ts
import { AuthGuard } from '@nestjs/passport';
import { createJwtGuard } from '../../jwt/factories/jwt-guard.factory';
import { RefreshTokenNoncesService } from '../../refresh-token-nonces/refresh-token-nonces.service';
import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/';
import { UsersService } from '../../users/users.service';

export const JwtConfirmEmailGuard = createJwtGuard('jwt-confirm-email');
export const JwtResetPasswordGuard = createJwtGuard('jwt-password-reset');

@Injectable()
export class JwtAuthGuard
    extends AuthGuard('jwt-access')
    implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly usersService: UsersService,
    ) {
        super();
    }

    private async validateUser(context: ExecutionContext): Promise<{
        isValid: boolean;
        user: any;
        userExists: any;
    }> {
        const request = context.switchToHttp().getRequest();
        const { user } = request;

        if (!user || !user.userId) {
            return { isValid: false, user, userExists: null };
        }

        const userExists = await this.usersService.findByIdWithoutPassword(
            user.userId,
        );

        return { isValid: !!userExists, user, userExists };
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        try {
            // TODO: Подумать, чтобы не выкидывать ошибку.
            const result = await super.canActivate(context);
            if (!result) {
                return isPublic;
            }

            const validation = await this.validateUser(context);

            if (isPublic || !validation.user || !validation.user.userId) {
                return true;
            }

            if (!validation.isValid) {
                throw new UnauthorizedException('User not found');
            }

            return true;
        } catch (error) {
            if (isPublic) {
                return true;
            }

            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException('Invalid token or authentication failed');
        }
    }
}

@Injectable()
export class JwtRefreshGuard
    extends AuthGuard('jwt-refresh')
    implements CanActivate {
    constructor(
        private readonly refreshTokenNonceService: RefreshTokenNoncesService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const canActivate = await super.canActivate(context);
            if (!canActivate) return false;

            const request = context.switchToHttp().getRequest();

            const { user } = request;
            if (!user || !user.nonce) {
                throw new BadRequestException(
                    'Refresh token does not contain nonce',
                );
            }

            const nonceRecord =
                await this.refreshTokenNonceService.findByNonceAndUserId(
                    user.userId,
                    user.nonce,
                );
            if (!nonceRecord) {
                throw new BadRequestException(
                    'Invalid or expired refresh token',
                );
            }

            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw new BadRequestException(
                    'Invalid or expired refresh token',
                );
            }
            throw error;
        }
    }
}
