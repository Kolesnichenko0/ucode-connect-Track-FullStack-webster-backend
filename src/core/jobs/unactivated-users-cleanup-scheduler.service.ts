// src/core/jobs/refresh-token-nonces-cleanup-scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { convertToSeconds } from 'src/common/utils/time.utils';
import { User } from 'src/core/users/entities/user.entity';
import { UsersService } from 'src/core/users/users.service';
import { ApiConfigService } from 'src/config/api-config.service';
import { JobsConstants } from './jobs.constants';

@Injectable()
export class UnactivatedUsersCleanupSchedulerService {
    constructor(
        private readonly usersService: UsersService,
        private cs: ApiConfigService,
    ) { }

    @Cron(JobsConstants.UNACTIVATED_USERS_CLEANUP_FROM_DB)
    async cleanupUnactivatedUsersFromDb() {
        const EXPIRATION_TIME = convertToSeconds(this.cs.get('jwt.expiresIn.confirmEmail'));
        const users: User[] =
            await this.usersService.findAllUnactivated(EXPIRATION_TIME);

        if (users.length > 0) {
            await Promise.all(
                users.map((user) => this.usersService.delete(user.id)),
            );
        }
    }
}
