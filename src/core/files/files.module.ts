// src/core/files/files.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileRepository } from './files.repository';
import { FilesController } from './files.controller';
import { FilePathsService } from './file-paths.service';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
    imports: [forwardRef(() => FileUploadModule)],
    controllers: [FilesController],
    providers: [
        FilesService,
        FileRepository,
        FilePathsService,
    ],
    exports: [FilesService, FilePathsService],
})
export class FilesModule {}
