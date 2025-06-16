// src/core/external-accounts/dto/create-external-account.dto.ts
import { ExternalAccountProvider } from '@prisma/client';
import { IsEnumValue, IsId, IsName } from '../../../common/validators';
import { IsUrlValue } from '../../../common/validators/url.validator';

export class CreateExternalAccountDto {
    @IsId(true)
    userId?: number;

    @IsEnumValue(ExternalAccountProvider, false)
    provider: ExternalAccountProvider;

    @IsName(false, false, 3, 200)
    accountId: string;

    @IsUrlValue(true, true)
    avatarUrl?: string | null;

    @IsName(true, true, 3, 200)
    refreshToken?: string | null; // Plain text refresh token
}
