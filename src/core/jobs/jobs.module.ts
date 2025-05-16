// src/jobs/jobs.module.ts
import { Module } from '@nestjs/common';
import { UserNotificationSchedulerService } from './user-notification-scheduler.service';
import { JwtCleanSchedulerService } from './jwt-clean-scheduler.service';
import { RefreshTokenNoncesModule } from 'src/core/refresh-token-nonces/refresh-token-nonces.module';
import { UsersModule } from 'src/core/users/users.module';

@Module({
    imports: [RefreshTokenNoncesModule, UsersModule],
    providers: [
        UserNotificationSchedulerService,
        JwtCleanSchedulerService
    ],
})
export class JobsModule { }
