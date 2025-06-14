// src/core/projects/projects.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectsRepository } from './projects.repository';
import { FilesModule } from '../../core/files/files.module';
import { FileUploadModule } from '../../core/file-upload/file-upload.module';
import { DatabaseModule } from '../../core/db/database.module';
import { UsersModule } from 'src/core/users/users.module';
import { ProjectsPaginationRepository } from './projects-pagination.repository';
import { PhotosModule } from '../photos/photos.module';

@Module({
    imports: [
        DatabaseModule,
        FilesModule,
        FileUploadModule,
        PhotosModule
    ],
    controllers: [ProjectsController],
    providers: [
        ProjectsService,
        ProjectsRepository,
        ProjectsPaginationRepository
    ],
    exports: [ProjectsService],
})
export class ProjectsModule {}
