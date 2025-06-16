// src/core/encryption/encryption.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ApiConfigService } from 'src/config/api-config.service';
import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    CipherGCM,
    DecipherGCM,
} from 'crypto';
import { EncryptionConstants } from './encryption.constants';

@Injectable()
export class EncryptionService {
    private readonly key: Buffer;

    constructor(private readonly configService: ApiConfigService) {
        const encryptionKey = this.configService.get('encryption.key');
        const keyBuffer = Buffer.from(encryptionKey, 'hex');
        if (keyBuffer.length !== EncryptionConstants.KEY_LENGTH) {
            throw new Error(
                `Invalid key length. Key for ${EncryptionConstants.ALGORITHM} must be ${EncryptionConstants.KEY_LENGTH} bytes.`,
            );
        }

        this.key = keyBuffer;
    }

    encrypt(text: string): string {
        if (!text) {
            throw new InternalServerErrorException(
                'Text to encrypt cannot be empty.',
            );
        }

        try {
            const iv = randomBytes(EncryptionConstants.IV_LENGTH);
            const cipher: CipherGCM = createCipheriv(
                EncryptionConstants.ALGORITHM,
                this.key,
                iv,
            ) as CipherGCM;

            const encrypted = Buffer.concat([
                cipher.update(text, 'utf8'),
                cipher.final(),
            ]);

            const tag = cipher.getAuthTag();

            // Format: IV || AuthTag || EncryptedData
            return Buffer.concat([iv, tag, encrypted]).toString('base64');
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new InternalServerErrorException('Encryption failed.');
        }
    }

    decrypt(encryptedText: string): string {
        if (!encryptedText) {
            throw new InternalServerErrorException(
                'Encrypted text cannot be empty.',
            );
        }

        try {
            const data = Buffer.from(encryptedText, 'base64');

            if (
                data.length <
                EncryptionConstants.IV_LENGTH +
                    EncryptionConstants.AUTH_TAG_LENGTH
            ) {
                throw new Error(
                    'Maybe an attack: invalid encrypted data length.',
                );
            }

            const iv = data.subarray(0, EncryptionConstants.IV_LENGTH);
            const tag = data.subarray(
                EncryptionConstants.IV_LENGTH,
                EncryptionConstants.IV_LENGTH +
                    EncryptionConstants.AUTH_TAG_LENGTH,
            );
            const encrypted = data.subarray(
                EncryptionConstants.IV_LENGTH +
                    EncryptionConstants.AUTH_TAG_LENGTH,
            );

            const decipher: DecipherGCM = createDecipheriv(
                EncryptionConstants.ALGORITHM,
                this.key,
                iv,
            ) as DecipherGCM;
            decipher.setAuthTag(tag);

            const decrypted = Buffer.concat([
                decipher.update(encrypted),
                decipher.final(), // This method will throw an error if the tag does not match (data is tampered with)
            ]);

            return decrypted.toString('utf8');
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new InternalServerErrorException('Decryption failed.');
        }
    }
}
