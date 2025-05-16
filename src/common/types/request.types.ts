// src/common/types/request.types.ts
import { Request } from 'express';

export interface UserPayloadType extends Request {
    userId: number;
}

export interface RefreshTokenPayloadType extends Request {
    expiresIn: number;
    createdAt: number;
    nonce: string;
}
