// src/core/auth/exceptions/invalid-refresh-token.exception.ts
import { BadRequestException } from '@nestjs/common';

export class InvalidRefreshTokenException extends BadRequestException {
    constructor(message = 'Invalid refresh token') {
        super({
            error: 'invalid_grant',
            message: message
        });
    }
}
