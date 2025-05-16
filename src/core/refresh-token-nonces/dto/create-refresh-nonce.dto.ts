// src/core/refresh-token-nonces/dto/create-refresh-nonce.dto.ts
import { IsId } from '../../../common/validators/id.validator';
import { IsName } from '../../../common/validators/name.validator';

export class CreateRefreshTokenNonceDto {
    @IsId(false)
    userId: number;

    @IsName(false)
    nonce: string;
}
