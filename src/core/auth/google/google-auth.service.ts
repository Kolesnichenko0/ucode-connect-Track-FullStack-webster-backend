// src/core/auth/google/google-auth.service.ts
import {
    Injectable,
    UnprocessableEntityException,
    ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { Profile } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service';
import { ExternalAccountsService } from '../../external-accounts/external-accounts.service';
import { ExternalAccountProvider } from '@prisma/client';
import { User } from '../../users/entities/user.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleAuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly externalAccountsService: ExternalAccountsService,
        private readonly authService: AuthService,
    ) {}

    async validateAndProcessGoogleProfile(
        googleProfile: Profile,
        refreshToken?: string,
    ): Promise<User> {
        const providerAccountId = googleProfile.id;
        const providerEmail = googleProfile.emails?.[0]?.value;
        const isEmailVerifiedByProvider =
            googleProfile.emails?.[0]?.verified === true;
        const firstName = googleProfile.name?.givenName;

        if (!isEmailVerifiedByProvider) {
            throw new ForbiddenException(
                'Google account email is not verified. Please verify your email with Google first.',
            );
        }
        if (!firstName) {
            throw new UnprocessableEntityException(
                'First name is missing from your Google profile. Please set it up in your Google account.',
            );
        }

        const externalAccount =
            await this.externalAccountsService.findByAccountIdAndProvider(
                providerAccountId,
                ExternalAccountProvider.GOOGLE,
            );

        if (externalAccount) {
            await this.externalAccountsService.update(externalAccount.id, {
                avatarUrl: googleProfile.photos?.[0]?.value || null,
                ...(refreshToken && { refreshToken }),
            });
            return this.usersService.findByIdWithoutPassword(
                externalAccount.userId,
            );
        }

        const externalAccountDto = {
            provider: ExternalAccountProvider.GOOGLE,
            accountId: providerAccountId,
            avatarUrl: googleProfile.photos?.[0]?.value || null,
            refreshToken: refreshToken || null,
        };

        try {
            const existingUserByEmail =
                await this.usersService.findByEmail(providerEmail);

            if (existingUserByEmail) {
                const { user } =
                    await this.externalAccountsService.createWithUpdateUser({
                        userId: existingUserByEmail.id,
                        ...externalAccountDto,
                    });
                return user;
            }

            throw new NotFoundException();
        } catch (error) {
            if (error instanceof NotFoundException) {
                const { user } = await this.externalAccountsService.createWithUser(
                    externalAccountDto,
                    {
                        email: providerEmail,
                        firstName,
                        ...(googleProfile.name?.familyName && {
                            lastName: googleProfile.name?.familyName,
                        }),
                    },
                );

                return user;
            }
            console.error('Error checking existing user by email:', error);
            throw error;
        }
    }

    async login(
        userId: number,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        return this.authService.createAuthTokens(userId);
    }
}
