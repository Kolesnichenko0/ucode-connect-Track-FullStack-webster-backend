// src/core/encryption/encryption.constants.ts

export const EncryptionConstants = {
    ALGORITHM: 'aes-256-gcm',
    IV_LENGTH: 12, // 96 bits
    AUTH_TAG_LENGTH: 16, // 128 bits
    KEY_LENGTH: 32, // 256 bits / 8 bytes
};
