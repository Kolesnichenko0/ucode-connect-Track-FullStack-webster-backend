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

    async findAll(seconds?: number): Promise<RefreshTokenNonce[]> {
        const where: any = {};

        if (seconds !== undefined) {
            const thresholdDate = new Date();
            thresholdDate.setSeconds(
                thresholdDate.getSeconds() - Number(seconds),
            );
            where.createdAt = {
                lt: thresholdDate,
            };
        }

        return this.db.refreshTokenNonce.findMany({
            where,
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
