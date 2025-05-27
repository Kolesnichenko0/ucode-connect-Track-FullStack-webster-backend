// src/core/files/files.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { DatabaseService } from '../db/database.service';
import { FileRepository } from './files.repository';
import { FilesController } from './files.controller';
import { FilePathService } from './file-path.utils';
import { UsersModule } from '../users/users.module';
import { FileCleanupService } from './scheduler/file-cleanup.scheduler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ScheduleModule.forRoot()
  ],
  controllers: [FilesController],
  providers: [
    FilesService, 
    FileRepository, 
    DatabaseService, 
    FilePathService,
    FileCleanupService
  ],
  exports: [FilesService, FilePathService],
})
export class FilesModule {}
