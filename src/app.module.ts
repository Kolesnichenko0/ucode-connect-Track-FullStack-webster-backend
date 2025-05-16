// src/app.module.ts
import { Module } from '@nestjs/common';
import { ApiConfigModule } from './config/api-config.module';
import { CoreModule } from './core/core.module';
import { ModulesModule } from './modules/modules.module';

@Module({
    imports: [
        ApiConfigModule,
        CoreModule,
        ModulesModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
