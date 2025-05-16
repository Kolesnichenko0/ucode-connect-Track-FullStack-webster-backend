// src/core/refresh-token-nonces/entities/refresh-token-nonce.entity.ts
import { RefreshTokenNonce as PrismaRefreshTokenNonce } from '@prisma/client';
import { User } from '../../users/entities/user.entity';

export class RefreshTokenNonce implements PrismaRefreshTokenNonce {
    id: number;
    userId: number;
    nonce: string;
    createdAt: Date;

    user?: User;
}
