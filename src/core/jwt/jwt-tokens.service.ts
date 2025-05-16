// src/core/jwt/jwt-token.utils.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    TokenType,
    JwtContext,
    TOKEN_CONTEXT_MAP,
    JwtPayload,
} from './jwt.types';
import { ApiConfigService } from 'src/config/api-config.service';

@Injectable()
export class JwtTokensService {
    private secrets: Record<TokenType, string>;
    private expirationTimes: Record<TokenType, string>;
    private issuers: Record<JwtContext, string>;
    private audiences: Record<JwtContext, string>;
    private algorithm: string;

    constructor(
        private cs: ApiConfigService,
        private jwtService: JwtService,
    ) {
        this.initializeConfig();
    }

    private initializeConfig() {
        const tokenTypes: TokenType[] = [
            'access',
            'refresh',
            'confirmEmail',
            'resetPassword',
        ];
        const contexts: JwtContext[] = ['auth'];

        this.secrets = {} as Record<TokenType, string>;
        this.expirationTimes = {} as Record<TokenType, string>;
        this.issuers = {} as Record<JwtContext, string>;
        this.audiences = {} as Record<JwtContext, string>;

        tokenTypes.forEach((type) => {
            this.secrets[type] = this.cs.get(`jwt.secrets.${type}`);
            this.expirationTimes[type] = this.cs.get(`jwt.expiresIn.${type}`);
        });

        contexts.forEach((context) => {
            this.issuers[context] = this.cs.get(`jwt.issuer.${context}`);
            this.audiences[context] = this.cs.get(`jwt.audience.${context}`);
        });

        this.algorithm = this.cs.get('jwt.algorithm');
    }

    generateToken(
        payload: Omit<JwtPayload, 'iss' | 'aud' | 'iat' | 'exp'>,
        type: TokenType,
    ): string {
        const context = TOKEN_CONTEXT_MAP[type];
        return this.jwtService.sign(
            {
                ...payload,
                iss: this.issuers[context],
                aud: this.audiences[context],
            },
            {
                secret: this.secrets[type],
                expiresIn: this.expirationTimes[type],
                algorithm: this.algorithm as any,
            },
        );
    }

    // verifyToken(token: string, type: TokenType): JwtPayload {
    //     const context = TOKEN_CONTEXT_MAP[type];
    //     return this.jwtService.verify(token, {
    //         secret: this.secrets[type],
    //         audience: this.audiences[context],
    //         issuer: this.issuers[context],
    //     });
    // }
}
