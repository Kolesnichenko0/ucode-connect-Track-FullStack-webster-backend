// src/core/external-accounts/guards/external-account-owner.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExternalAccountsService } from '../external-accounts.service';

@Injectable()
export class ExternalAccountOwnerGuard implements CanActivate {
    constructor(
        private readonly externalAccountsService: ExternalAccountsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const externalAccountId = request.params.id;

        if (!user || !externalAccountId) {
            throw new ForbiddenException('Access denied');
        }

        const externalAccount=
            await this.externalAccountsService.findById(externalAccountId);

        if (externalAccount.userId != user.userId) {
            throw new ForbiddenException('You do not own this external account');
        }

        return true;
    }
}
