// src/core/file-upload/file-upload.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [forwardRef(() => FilesModule)],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
