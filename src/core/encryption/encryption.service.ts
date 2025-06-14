// src/core/encryption/encryption.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ApiConfigService } from 'src/config/api-config.service';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

@Injectable()
export class EncryptionService {
    private readonly key: Buffer;

    constructor(private readonly configService: ApiConfigService) {
        const encryptionKey = this.configService.get('encryption.key');
        this.key = Buffer.from(encryptionKey, 'hex');
    }

    encrypt(text: string): string {
        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
            const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
            const authTag = cipher.getAuthTag();
            return Buffer.concat([iv, authTag, encrypted]).toString('base64');
        } catch (error) {
            throw new InternalServerErrorException('Encryption failed.', error.message);
        }
    }

    decrypt(encryptedText: string): string {
        try {
            const data = Buffer.from(encryptedText, 'base64');
            const iv = data.slice(0, IV_LENGTH);
            const authTag = data.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
            const encrypted = data.slice(IV_LENGTH + AUTH_TAG_LENGTH);

            const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
            decipher.setAuthTag(authTag);

            return decipher.update(encrypted) + decipher.final('utf8');
        } catch (error) {
            // This can happen if the key is wrong or data is tampered with.
            throw new InternalServerErrorException('Decryption failed.', error.message);
        }
    }
}
