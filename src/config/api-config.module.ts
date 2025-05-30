// src/config/api-config.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ApiConfigService } from './api-config.service';
import getAppConfig from './configs/app.config';
import getJwtConfig from './configs/jwt.config';
import getDatabaseConfig from './configs/database.config';
import getEtherealConfig from './configs/ethereal.config';
import getGoogleConfig from './configs/google.config';
import getAssetsConfig from './configs/assets.config';
import getStorageConfig from './configs/storage.config';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [
                getAppConfig,
                getJwtConfig,
                getDatabaseConfig,
                getEtherealConfig,
                getGoogleConfig,
                getStorageConfig,
                getAssetsConfig,
            ],
            envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
            isGlobal: true,
            expandVariables: true,
        }),
    ],
    providers: [ApiConfigService],
    exports: [ApiConfigService],
})
export class ApiConfigModule {}
