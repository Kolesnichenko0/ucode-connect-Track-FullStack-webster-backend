// src/core/external-accounts/entities/external-account.entity.ts
import {
    ExternalAccount as PrismaExternalAccount,
    ExternalAccountProvider,
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ExternalAccount implements PrismaExternalAccount {
    @Expose()
    @ApiProperty({
        description: 'External account identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['internal'] })
    userId: number;

    @Expose()
    @ApiProperty({
        enum: ExternalAccountProvider,
        description: 'The external authentication provider',
        example: ExternalAccountProvider.GOOGLE,
    })
    provider: ExternalAccountProvider;

    @Expose({ groups: ['internal'] })
    accountId: string;

    @Expose()
    @ApiProperty({
        description: "URL of the user's profile picture from this provider",
        example: 'https://lh3.googleusercontent.com/a/ACg8ocJ...=s96-c',
        nullable: true,
        type: String,
    })
    avatarUrl: string | null;

    @Expose({ groups: ['internal'] })
    refreshToken: string | null;

    @Expose()
    @ApiProperty({ description: 'Timestamp of link creation' })
    createdAt: Date;

    @Expose({ groups: ['internal'] })
    updatedAt: Date;
}
