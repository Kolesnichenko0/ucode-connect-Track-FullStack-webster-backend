// src/core/file-upload/file-upload.module.ts
import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
