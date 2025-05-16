// src/core/hashing/hashing.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export enum HashType {
    PASSWORD = 'password',
}

@Injectable()
export class HashingService {
    private readonly saltRoundsConfig: Record<HashType, number>;
    private readonly PASSWORD_SALT_ROUNDS: number = 10;

    constructor() {
        this.saltRoundsConfig = {
            [HashType.PASSWORD]: this.PASSWORD_SALT_ROUNDS
        };
    }

    async hash(plainText: string, type: HashType): Promise<string> {
        return bcrypt.hash(plainText, this.saltRoundsConfig[type]);
    }

    async compare(
        plainText: string,
        hashedText: string,
    ): Promise<boolean> {
        return bcrypt.compare(plainText, hashedText);
    }
}
