// src/core/refresh-token-nonces/refresh-token-nonces.repository.ts
import { Injectable } from '@nestjs/common';
import { RefreshTokenNonce } from './entities/refresh-token-nonce.entity';
import { DatabaseService } from '../db/database.service';

@Injectable()
export class RefreshTokenNoncesRepository {
    constructor(private readonly db: DatabaseService) { }

    async create(
        data: Partial<RefreshTokenNonce>,
    ): Promise<RefreshTokenNonce> {
        return this.db.refreshTokenNonce.create({
            data: data as any,
        });
    }

    async findAllExpiredByCreatedAt(createdBefore: Date): Promise<RefreshTokenNonce[]> {
        return this.db.refreshTokenNonce.findMany({
            where: {
                createdAt: { lt: createdBefore },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByNonceAndUserId(
        userId: number,
        nonce: string,
    ): Promise<RefreshTokenNonce | null> {
        return this.db.refreshTokenNonce.findFirst({
            where: {
                nonce,
                userId,
            },
            include: { user: true },
        });
    }

    async deleteById(nonceId: number): Promise<void> {
        await this.db.refreshTokenNonce.delete({
            where: { id: nonceId },
        });
    }

    async deleteByUserId(userId: number): Promise<void> {
        await this.db.refreshTokenNonce.deleteMany({
            where: { userId },
        });
    }
}
