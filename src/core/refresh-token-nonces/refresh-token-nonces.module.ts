// src/core/refresh-token-nonces/refresh-token-nonces.module.ts
import { Module } from '@nestjs/common';
import { RefreshTokenNoncesService } from './refresh-token-nonces.service';
import { RefreshTokenNoncesRepository } from './refresh-token-nonces.repository';
import { UsersModule } from 'src/core/users/users.module';

@Module({
    imports: [
        UsersModule,
    ],
    providers: [
        RefreshTokenNoncesService,
        RefreshTokenNoncesRepository,
    ],
    exports: [RefreshTokenNoncesService],
})
export class RefreshTokenNoncesModule { }
