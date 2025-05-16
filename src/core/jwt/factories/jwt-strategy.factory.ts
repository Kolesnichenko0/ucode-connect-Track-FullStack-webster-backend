// src/core/jwt/factories/jwt-strategy.factory.ts
import { Injectable, Type } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-jwt';
import { Algorithm } from 'jsonwebtoken';
import { ApiConfigService } from 'src/config/api-config.service';
import { TokenType, JwtContext, TOKEN_CONTEXT_MAP } from '../jwt.types';

export interface JwtStrategyConfig {
    strategyName: string;
    tokenType: TokenType;
    extractor: (req: any) => any;
    validateFn: (payload: any, req?: any) => any;
    handleError?: (error: Error) => void;
}

export function createJwtStrategy(config: JwtStrategyConfig): Type<any> {
    @Injectable()
    class GenericJwtStrategy extends PassportStrategy(
        Strategy,
        config.strategyName,
    ) {
        constructor(private readonly cs: ApiConfigService) {
            const tokenType: TokenType = config.tokenType;
            const context: JwtContext = TOKEN_CONTEXT_MAP[tokenType];

            const strategyOptions: StrategyOptions = {
                jwtFromRequest: config.extractor,
                ignoreExpiration: false,
                secretOrKey: cs.get(`jwt.secrets.${tokenType}`),
                audience: cs.get(`jwt.audience.${context}`),
                issuer: cs.get(`jwt.issuer.${context}`),
                algorithms: [
                    cs.get('jwt.algorithm') as Algorithm,
                ],
            };
            super(strategyOptions);
        }

        validate(payload: any, req?: any): any {
            try {
                return config.validateFn(payload, req);
            } catch (error) {
                if (config.handleError) {
                    config.handleError(error);
                }
                throw error;
            }
        }
    }

    return GenericJwtStrategy;
}
