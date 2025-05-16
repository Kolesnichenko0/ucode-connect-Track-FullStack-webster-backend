// src/core/jobs/jobs.constants.ts
import { CronExpression } from '@nestjs/schedule';

export const JobsConstants = {
    UNACTIVATED_ACCOUNT_NOTIFICATION: CronExpression.EVERY_30_MINUTES,
    CLEAN_REFRESH_TOKENS_FROM_DB: CronExpression.EVERY_DAY_AT_10AM,
};
