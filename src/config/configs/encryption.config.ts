// src/config/configs/encryption.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';

const EncryptionSchema = z.object({
    ENCRYPTION_KEY: z.string().length(64, 'Encryption key must be 64 hexadecimal characters (32 bytes)'),
});

export type IEncryptionConfig = ReturnType<typeof getEncryptionConfig>;

const getEncryptionConfig = () => {
    const config = ConfigValidator.validate(process.env, EncryptionSchema) as z.infer<typeof EncryptionSchema>;
    return {
        encryption: {
            key: config.ENCRYPTION_KEY,
        },
    };
};

export default getEncryptionConfig;
