// src/core/auth/strategies/jwt-reset-password.strategy.ts
import { createJwtStrategy } from '../../jwt/factories/jwt-strategy.factory';

const passwordResetExtractor = (req: any): string | null => {
    return req?.params?.confirm_token || null;
};

const resetPasswordValidateFn = (payload: any) => {
    return { userId: payload.sub };
};

export const JwtResetPasswordStrategy = createJwtStrategy({
    strategyName: 'jwt-password-reset',
    tokenType: 'resetPassword',
    extractor: passwordResetExtractor,
    validateFn: resetPasswordValidateFn,
});
