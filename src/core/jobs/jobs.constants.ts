// src/core/jobs/jobs.constants.ts
import { CronExpression } from '@nestjs/schedule';

export const JobsConstants = {
    UNACTIVATED_USERS_CLEANUP_FROM_DB: CronExpression.EVERY_30_MINUTES,
    REFRESH_TOKEN_NONCES_CLEANUP_FROM_DB: CronExpression.EVERY_DAY_AT_10AM,
    SOFT_DELETED_FILES_CLEANUP_FROM_DB_AND_STORAGE: CronExpression.EVERY_DAY_AT_MIDNIGHT,
    GOOGLE_AVATAR_UPDATE: CronExpression.EVERY_30_MINUTES,
};
