// src/core/external-accounts/dto/update-external-account.dto.ts
import { PartialType, PickType } from '@nestjs/swagger';
import { CreateExternalAccountDto } from './create-external-account.dto';

export class UpdateExternalAccountDto extends PartialType(
    PickType(CreateExternalAccountDto, ['avatarUrl', 'refreshToken'] as const),
) {}
