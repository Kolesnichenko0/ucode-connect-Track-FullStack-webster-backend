// src/core/jobs/refresh-token-nonces-cleanup-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import { RefreshTokenNoncesService } from 'src/core/refresh-token-nonces/refresh-token-nonces.service';
import { convertToSeconds } from 'src/common/utils/time.utils';
import { RefreshTokenNonce } from 'src/core/refresh-token-nonces/entities/refresh-token-nonce.entity';
import { ApiConfigService } from 'src/config/api-config.service';
import { JobsConstants } from './jobs.constants';

@Injectable()
export class RefreshTokenNoncesCleanupSchedulerService {
    constructor(
        private readonly refreshTokenNonceService: RefreshTokenNoncesService,
        private cs: ApiConfigService,
    ) {}

    @Cron(JobsConstants.REFRESH_TOKEN_NONCES_CLEANUP_FROM_DB)
    @Timeout(10000)
    async cleanupRefreshTokenNoncesFromDb() {
        const expirationTimeInSeconds = convertToSeconds(
            this.cs.get('jwt.expiresIn.refresh'),
        );

        const createdBefore = new Date();
        createdBefore.setSeconds(createdBefore.getSeconds() - expirationTimeInSeconds);

        const nonces: RefreshTokenNonce[] =
            await this.refreshTokenNonceService.findAllExpiredByCreatedAt(
                createdBefore,
            );

        if (nonces.length > 0) {
            await Promise.all(
                nonces.map((nonce) =>
                    this.refreshTokenNonceService.deleteById(nonce.id),
                ),
            );
        }
    }
}
