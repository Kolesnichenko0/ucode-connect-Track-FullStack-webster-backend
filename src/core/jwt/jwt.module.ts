// src/core/jwt/jwt.module.ts
import { Module } from '@nestjs/common';
import { JwtModule as JwtNestModule } from '@nestjs/jwt';
import { JwtTokensService } from './jwt-tokens.service';

@Module({
    imports: [
        JwtNestModule.register({}), 
    ],
    providers: [JwtTokensService],
    exports: [JwtTokensService, JwtNestModule],
})
export class JwtModule {}
