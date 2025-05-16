// src/core/google/google.module.ts
import { Module } from '@nestjs/common';
import { GoogleOAuthService } from './google-oauth.service';

@Module({
    imports: [],
    providers: [GoogleOAuthService],
    exports: [GoogleOAuthService],
})
export class GoogleModule { }
