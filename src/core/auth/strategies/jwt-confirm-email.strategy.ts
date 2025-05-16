// src/core/auth/strategies/jwt-confirm-email.strategy.ts
import { createJwtStrategy } from '../../jwt/factories/jwt-strategy.factory';

const confirmEmailExtractor = (req: any): string | null => {
    return req?.params?.confirm_token || null;
};

const confirmEmailValidateFn = (payload: any) => {
    return { userId: payload.sub };
};

export const JwtConfirmEmailStrategy = createJwtStrategy({
    strategyName: 'jwt-confirm-email',
    tokenType: 'confirmEmail',
    extractor: confirmEmailExtractor,
    validateFn: confirmEmailValidateFn,
});
