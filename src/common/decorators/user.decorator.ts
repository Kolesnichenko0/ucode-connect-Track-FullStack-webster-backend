// src/common/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayloadType } from '../types/request.types';

export const UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        if (!request.user) {
            return null;
        }

        const userId: UserPayloadType = request.user.userId;

        return userId;
    },
);
