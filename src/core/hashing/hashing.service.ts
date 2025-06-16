// src/core/hashing/hashing.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashType} from './hashing.enums';
import { HashingConstants } from './hashing.constants';

@Injectable()
export class HashingService {
    private readonly bcryptSaltRoundsConfig: Record<HashType, number>;

    constructor() {
        this.bcryptSaltRoundsConfig = {
            [HashType.PASSWORD]: HashingConstants.BCRYPT_PASSWORD_SALT_ROUNDS,
        };
    }

    async hash(plainText: string, type: HashType): Promise<string> {
        return bcrypt.hash(plainText, this.bcryptSaltRoundsConfig[type]);
    }

    async compare(
        plainText: string,
        hashedText: string,
    ): Promise<boolean> {
        return bcrypt.compare(plainText, hashedText);
    }
}
