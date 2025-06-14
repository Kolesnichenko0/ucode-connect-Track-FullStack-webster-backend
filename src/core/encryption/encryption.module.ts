// src/core/encryption/encryption.module.ts
import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';

@Module({
    providers: [EncryptionService],
    exports: [EncryptionService],
})
export class EncryptionModule {}
