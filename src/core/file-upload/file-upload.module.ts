// src/core/file-upload/file-upload.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FilesModule } from '../files/files.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [FilesModule],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
