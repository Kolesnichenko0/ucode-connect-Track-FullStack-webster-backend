// src/core/external-accounts/external-accounts.service.ts
import {
    Injectable,
    ConflictException,
    NotFoundException,
    UnprocessableEntityException, forwardRef, Inject,
} from '@nestjs/common';
import { ExternalAccountsRepository } from './external-accounts.repository';
import { ExternalAccount } from './entities/external-account.entity';
import { ExternalAccountProvider } from '@prisma/client';
import { CreateExternalAccountDto } from './dto/create-external-account.dto';
import { EncryptionService } from '../encryption/encryption.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { plainToInstance } from 'class-transformer';
import { UpdateExternalAccountDto } from './dto/update-external-account.dto';
import { CreateUserFromExternalProviderDto } from '../users/dto/create-user-from-external-provider.dto';
import { google } from 'googleapis';

@Injectable()
export class ExternalAccountsService {
    private readonly googleOauth2Client;

    constructor(
        private readonly externalAccountsRepository: ExternalAccountsRepository,
        private readonly encryptionService: EncryptionService,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
    ) {
        this.googleOauth2Client = new google.auth.OAuth2();
    }

    private mapToEntity(
        prismaInstance: any,
        groups: string[] = [],
    ): ExternalAccount {
        return plainToInstance(ExternalAccount, prismaInstance, {
            groups,
            excludeExtraneousValues: true,
        });
    }

    async findAllWithRefreshToken(
        provider: ExternalAccountProvider,
    ): Promise<ExternalAccount[]> {
        const accounts =
            await this.externalAccountsRepository.findAllWithRefreshTokenByProvider(
                provider,
            );
        return accounts.map((acc) => this.mapToEntity(acc, ['internal']));
    }

    async findAllByUserId(userId: number): Promise<ExternalAccount[]> {
        const accounts =
            await this.externalAccountsRepository.findAllByUserId(userId);
        return accounts.map((acc) => this.mapToEntity(acc));
    }

    async findByAccountIdAndProvider(
        accountId: string,
        provider: ExternalAccountProvider,
    ): Promise<ExternalAccount | null> {
        const account =
            await this.externalAccountsRepository.findByAccountIdAndProvider(
                accountId,
                provider,
            );
        return account ? this.mapToEntity(account, ['internal']) : null;
    }

    async findById(id: number): Promise<ExternalAccount> {
        const account = await this.externalAccountsRepository.findById(id);
        if (!account) {
            throw new NotFoundException('External account not found.');
        }
        return this.mapToEntity(account, ['internal']);
    }

    async create(dto: CreateExternalAccountDto): Promise<ExternalAccount> {
        const existingByProviderId =
            await this.externalAccountsRepository.findByAccountIdAndProvider(
                dto.accountId,
                dto.provider,
            );
        if (existingByProviderId) {
            throw new ConflictException(
                `This ${dto.provider} account is already linked to another user.`,
            );
        }

        const existingByUserIdAndProvider =
            await this.externalAccountsRepository.findByUserIdAndProvider(
                dto.userId as number,
                dto.provider,
            );
        if (existingByUserIdAndProvider) {
            throw new ConflictException(
                `User already has an account with ${dto.provider} linked.`,
            );
        }

        const encryptedRefreshToken = dto.refreshToken
            ? this.encryptionService.encrypt(dto.refreshToken)
            : null;

        const createdAccount = await this.externalAccountsRepository.create({
            user: { connect: { id: dto.userId } },
            provider: dto.provider,
            accountId: dto.accountId,
            avatarUrl: dto.avatarUrl,
            refreshToken: encryptedRefreshToken,
        });
        return this.mapToEntity(createdAccount);
    }

    async createWithUser(
        externalAccountDto: CreateExternalAccountDto,
        userFromExternalProviderDto: CreateUserFromExternalProviderDto,
    ): Promise<{ externalAccount: ExternalAccount; user: User }> {
        const user = await this.usersService.createFromExternalProvider(
            userFromExternalProviderDto,
        );
        const externalAccount = await this.create({
            ...externalAccountDto,
            userId: user.id,
        });
        return { externalAccount, user };
    }

    async createWithUpdateUser(
        externalAccountDto: CreateExternalAccountDto,
    ): Promise<{ externalAccount: ExternalAccount; user: User }> {
        const user = await this.usersService.confirmEmail(
            externalAccountDto.userId as number,
        );
        const externalAccount = await this.create(externalAccountDto);

        return {
            externalAccount: externalAccount,
            user: user,
        };
    }

    async update(
        id: number,
        data: UpdateExternalAccountDto,
    ): Promise<ExternalAccount> {
        return this.externalAccountsRepository.update(id, data);
    }

    async revokeGoogleToken(refreshToken: string): Promise<boolean> {
        try {
            await this.googleOauth2Client.revokeToken(refreshToken);
            return true;
        } catch (error) {
            console.error(
                'Failed to revoke Google token:',
                error.message || error,
            );
            return true;
        }
    }

    async delete(
        id: number,
        ensureAccessPreservation: boolean = true,
    ): Promise<void> {
        const accountToUnlink =
            await this.externalAccountsRepository.findById(id);

        if (!accountToUnlink) {
            throw new NotFoundException('External account not found.');
        }

        if (ensureAccessPreservation) {
            const user = accountToUnlink.user;
            const hasPassword = !!user.password;
            const otherExternalAccounts = (
                await this.externalAccountsRepository.findAllByUserId(user.id)
            ).filter((ea) => ea.id !== id);

            if (!hasPassword && otherExternalAccounts.length === 0) {
                throw new UnprocessableEntityException(
                    'Cannot unlink the only authentication method. Please set a password for your account first.',
                );
            }
        }

        if (accountToUnlink.refreshToken) {
            const refreshToken = this.encryptionService.decrypt(
                accountToUnlink.refreshToken,
            );
            if (refreshToken) {
                switch (accountToUnlink.provider) {
                    case ExternalAccountProvider.GOOGLE:
                        await this.revokeGoogleToken(refreshToken);
                        break;
                    default:
                        throw new UnprocessableEntityException(
                            `Cannot revoke token for provider ${accountToUnlink.provider}.`,
                        );
                }
            }
        }

        await this.externalAccountsRepository.delete(id);
    }
}
