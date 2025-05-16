// src/core/refresh-token-nonces/refresh-token-nonces.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRefreshTokenNonceDto } from './dto/create-refresh-nonce.dto';
import { RefreshTokenNonce } from './entities/refresh-token-nonce.entity';
import { RefreshTokenNoncesRepository } from './refresh-token-nonces.repository';

@Injectable()
export class RefreshTokenNoncesService {
    constructor(
        private readonly nonceRepository: RefreshTokenNoncesRepository,
    ) { }

    async create(
        createTokenDto: CreateRefreshTokenNonceDto,
    ): Promise<RefreshTokenNonce> {
        return await this.nonceRepository.create(createTokenDto);
    }

    async findAll(time?: number): Promise<RefreshTokenNonce[]> {
        return await this.nonceRepository.findAll(time);
    }

    async findByNonceAndUserId(
        userId: number,
        nonce: string,
    ): Promise<RefreshTokenNonce> {
        const NonceRes =
            await this.nonceRepository.findByNonceAndUserId(
                userId,
                nonce,
            );
        if (!NonceRes) {
            throw new NotFoundException(
                `Nonce for user not found`,
            );
        }
        return NonceRes;
    }

    async deleteById(NonceId: number): Promise<void> {
        return await this.nonceRepository.deleteById(NonceId);
    }

    async deleteByUserId(userId: number): Promise<void> {
        return await this.nonceRepository.deleteByUserId(
            userId,
        );
    }
}
