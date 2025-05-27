// src/core/files/files.controller.ts
import { 
  Controller, 
  Get, 
  Param, 
  Res, 
  UseGuards,
  StreamableFile,
  Delete,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FilesService } from './files.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { File, TargetType } from '@prisma/client';
import { FilePathService } from './file-path.utils';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { FileOwnerGuard } from './guards/file-owner.guard';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { UserId } from '../../common/decorators/user.decorator';
import { Public } from 'src/common/decorators';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
  ) {}

  @Get('default/:target_type')
  @Public()
  @ApiOperation({ summary: 'Get all default file URLs by target type' })
  @ApiParam({ name: 'target_type', description: 'Target type', enum: TargetType })
  async getDefaultFileUrls(
    @Param('target_type') targetType: TargetType,
  ): Promise<string[]> {
    return this.filesService.getDefaultFileUrlsByTargetType(targetType);
  }

  @Get(':fileKey')
  @UseGuards(JwtAuthGuard, FileOwnerGuard)
  @ApiOperation({ summary: 'Download file by key' })
  @ApiParam({ name: 'fileKey', description: 'File key', type: 'string' })
  async downloadFile(
    @Param('fileKey') fileKey: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return this.filesService.getFileStreamByKey(fileKey, res);
  }

  @Delete(':fileKey')
  @UseGuards(JwtAuthGuard, FileOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark file for deletion' })
  @ApiParam({ name: 'fileKey', description: 'File key', type: 'string' })
  async markForDeletion(
    @Param('fileKey') fileKey: string,
    @UserId() user: any,
  ): Promise<void> {
    await this.filesService.softDeleteByFileKey(fileKey);
  }
}
