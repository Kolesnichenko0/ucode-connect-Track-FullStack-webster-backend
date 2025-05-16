// src/core/users/guards/account-owner.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AccountOwnerGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const requestUserId: number = request.params.id;

        if (!user || !requestUserId) {
            throw new ForbiddenException('Access denied');
        }

        if (user.userId != requestUserId) {
            throw new ForbiddenException(
                'You can only access your own account',
            );
        }

        return true;
    }
}
