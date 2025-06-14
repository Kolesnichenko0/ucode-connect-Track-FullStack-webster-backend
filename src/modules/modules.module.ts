// src/modules/modules.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { PhotosModule } from './photos/photos.module';

@Module({
    imports: [
        // FontsModule,
        ProjectsModule,
        PhotosModule,
    ],
})
export class ModulesModule { }
