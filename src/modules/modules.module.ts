// src/modules/modules.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';

@Module({
    imports: [
        // FontsModule,
        ProjectsModule,
    ],
})
export class ModulesModule { }
