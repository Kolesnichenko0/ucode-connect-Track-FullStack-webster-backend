// src/common/decorators/refresh-token.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshTokenPayloadType } from '../types/request.types';

export const RefreshTokenPayload = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const { userId, ...payload } = request.user;

        const refreshTokenPayload: RefreshTokenPayloadType = payload;

        return data ? refreshTokenPayload?.[data] : refreshTokenPayload;
    },
);
