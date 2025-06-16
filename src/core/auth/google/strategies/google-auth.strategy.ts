// src/core/auth/google/strategies/google-auth.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiConfigService } from '../../../../config/api-config.service';
import { GoogleAuthService } from '../google-auth.service';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(
    Strategy,
    'google-oauth20',
) {
    constructor(
        private readonly cs: ApiConfigService,
        private readonly googleAuthService: GoogleAuthService,
    ) {
        super({
            clientID: cs.get('google.clientId'),
            clientSecret: cs.get('google.clientSecret'),
            callbackURL: cs.get('google.callbackUrl'),
            scope: ['openid', 'email', 'profile'],
            accessType: 'offline',
            prompt: 'consent',
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string | undefined,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<any> {
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);
        console.log('profile', profile);

        if (!profile) {
            return done(
                new UnauthorizedException('No profile received from Google.'),
                false,
            );
        }
        try {
            const user =
                await this.googleAuthService.validateAndProcessGoogleProfile(
                    profile,
                    refreshToken,
                );

            done(null, { userId: user.id });
        } catch (err) {
            done(err, false);
        }
    }
}
