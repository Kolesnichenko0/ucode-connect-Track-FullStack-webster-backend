// src/core/jwt/jwt.types.ts
export type TokenType =
    | 'access'
    | 'refresh'
    | 'confirmEmail'
    | 'resetPassword'
export type JwtContext = 'auth';

export const TOKEN_CONTEXT_MAP: Record<TokenType, JwtContext> = {
    access: 'auth',
    refresh: 'auth',
    confirmEmail: 'auth',
    resetPassword: 'auth',
};

export interface JwtPayload {
    sub: number;
    nonce?: string;
    iss: string;
    aud: string;
    iat: number;
    exp: number;
}
