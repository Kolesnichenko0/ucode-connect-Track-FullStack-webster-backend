// src/core/google/google-oauth.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ApiConfigService } from 'src/config/api-config.service';

@Injectable()
export class GoogleOAuthService {
    private oauth2Client;
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;
    private currentRefreshToken: string;

    constructor(private cs: ApiConfigService) {
        this.clientId = cs.get('google.clientId');
        this.clientSecret = cs.get('google.clientSecret');
        this.redirectUri = cs.get('google.redirectUri');
        this.oauth2Client = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            this.redirectUri,
        );
    }

    setCredentials(refreshToken: string): void {
        this.currentRefreshToken = refreshToken;
        this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    }

    async getAccessToken(): Promise<string> {
        try {
            const { token } = await this.oauth2Client.getAccessToken();
            return token;
        } catch (error) {
            console.error('Failed to get access token', error);
            throw error;
        }
    }

    getOAuthCredentials() {
        return {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            refreshToken: this.currentRefreshToken,
            redirectUri: this.redirectUri,
        };
    }

    getAuthUrl(scopes: string[] = ['openid']): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
        });
    }

    // Exchange authorization code for tokens
    async getTokensFromCode(code: string): Promise<any> {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            return tokens;
        } catch (error) {
            console.error('Failed to get tokens from code', error);
            throw error;
        }
    }

    async getUserProfile(accessToken: string): Promise<any> {
        try {
            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: accessToken });

            const oauth2 = google.oauth2({
                auth: oauth2Client,
                version: 'v2',
            });

            const { data } = await oauth2.userinfo.get();
            return data;
        } catch (error) {
            console.error('Failed to get users profile', error);
            throw error;
        }
    }
}
