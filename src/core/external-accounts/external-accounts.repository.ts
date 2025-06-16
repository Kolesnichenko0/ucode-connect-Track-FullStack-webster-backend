// src/core/external-accounts/external-accounts.repository.ts
import { Injectable } from '@nestjs/common';
import {
    Prisma,
    ExternalAccount as PrismaExternalAccount,
    ExternalAccountProvider,
    User as PrismaUser,
} from '@prisma/client';
import { DatabaseService } from '../db/database.service';

@Injectable()
export class ExternalAccountsRepository {
    constructor(private readonly db: DatabaseService) {
    }

    async create(
        data: Prisma.ExternalAccountCreateInput,
    ): Promise<PrismaExternalAccount> {
        return this.db.externalAccount.create({ data });
    }

    async findAllWithRefreshTokenByProvider(
        provider: ExternalAccountProvider,
    ): Promise<PrismaExternalAccount[]> {
        return this.db.externalAccount.findMany({
            where: {
                provider,
                refreshToken: { not: null },
            },
        });
    }

    async findAllByUserId(
        userId: number,
    ): Promise<(PrismaExternalAccount & { user: PrismaUser })[]> {
        return this.db.externalAccount.findMany({
            where: { userId },
            include: { user: true },
        });
    }


    async findById(
        id: number,
    ): Promise<(PrismaExternalAccount & { user: PrismaUser }) | null> {
        return this.db.externalAccount.findUnique({
            where: { id },
            include: { user: true },
        });
    }

    async findByAccountIdAndProvider(
        accountId: string,
        provider: ExternalAccountProvider,
    ): Promise<(PrismaExternalAccount & { user: PrismaUser }) | null> {
        return this.db.externalAccount.findUnique({
            where: {
                accountId_provider: { provider, accountId },
            },
            include: { user: true },
        });
    }

    async findByUserIdAndProvider(
        userId: number,
        provider: ExternalAccountProvider,
    ): Promise<(PrismaExternalAccount & { user: PrismaUser }) | null> {
        return this.db.externalAccount.findUnique({
            where: {
                userId_provider: { userId, provider },
            },
            include: { user: true },
        });
    }

    async update(
        id: number,
        data: Prisma.ExternalAccountUpdateInput,
    ): Promise<PrismaExternalAccount> {
        return this.db.externalAccount.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<PrismaExternalAccount> {
        return this.db.externalAccount.delete({
            where: { id },
        });
    }
}
