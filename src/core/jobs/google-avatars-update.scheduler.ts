// src/core/jobs/google-avatar-update.scheduler.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { google } from 'googleapis';
import { ExternalAccountsService } from '../external-accounts/external-accounts.service';
import { ExternalAccountProvider } from '@prisma/client';
import { EncryptionService } from '../encryption/encryption.service';
import { ApiConfigService } from '../../config/api-config.service';
import { JobsConstants } from './jobs.constants';
import { ExternalAccount } from '../external-accounts/entities/external-account.entity';

@Injectable()
export class GoogleAvatarsUpdateScheduler {
    constructor(
        private readonly externalAccountsService: ExternalAccountsService,
        private readonly encryptionService: EncryptionService,
        private readonly cs: ApiConfigService,
    ) {}

    @Cron(JobsConstants.GOOGLE_AVATAR_UPDATE)
    async updateGoogleAvatars() {
        const googleAccounts =
            await this.externalAccountsService.findAllWithRefreshToken(
                ExternalAccountProvider.GOOGLE,
            );

        for (const account of googleAccounts) {
            await this.updateAccountAvatar(account);
        }
    }

    private async updateAccountAvatar(account: ExternalAccount) {
        const refreshToken = this.encryptionService.decrypt(
            account.refreshToken as string,
        );

        if (!refreshToken) {
            console.warn(`No refresh token for account ${account.id}`);
            return;
        }

        try {
            const oauth2Client = new google.auth.OAuth2(
                this.cs.get('google.clientId'),
                this.cs.get('google.clientSecret'),
            );

            oauth2Client.setCredentials({
                refresh_token: refreshToken,
            });

            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });

            const { data: profileData } = await oauth2.userinfo.get();

            const newAvatarUrl = profileData.picture;

            if (newAvatarUrl && newAvatarUrl !== account.avatarUrl) {
                await this.externalAccountsService.update(account.id, {
                    avatarUrl: newAvatarUrl,
                });

                console.log(
                    `Updated avatar for user ${account.userId}: ${newAvatarUrl}`,
                );
            }
        } catch (error) {
            console.error(
                `Failed to update avatar for account ${account.id}:`,
                error.message,
            );

            if (this.isInvalidGrantError(error)) {
                console.warn(
                    `Invalid refresh token for account ${account.id}, removing it`,
                );

                await this.externalAccountsService.update(account.id, {
                    refreshToken: null,
                });
            }
        }
    }

    private isInvalidGrantError(error: any): boolean {
        return (
            error.message?.includes('invalid_grant') ||
            error.response?.data?.error === 'invalid_grant'
        );
    }
}
