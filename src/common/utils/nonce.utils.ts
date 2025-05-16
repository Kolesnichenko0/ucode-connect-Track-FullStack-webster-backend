// src/common/utils/nonce.utils.ts
import { randomBytes } from 'crypto';

export function generateNonce(bytesLength = 16): string {
    return randomBytes(bytesLength).toString('hex');
}

