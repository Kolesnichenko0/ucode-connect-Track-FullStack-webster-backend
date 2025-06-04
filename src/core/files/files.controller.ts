// src/core/files/files.controller.ts
import {
    Controller,
    Get,
    Delete,
    Param,
    UseGuards,
    HttpStatus,
    Res,
    BadRequestException,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';
import { StreamableFile } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilePathsService } from './file-paths.service';
import { FileOwnerGuard } from './guards/file-owner.guard';
import { FileUploadService } from '../file-upload/file-upload.service';
import {
    UPLOAD_CATEGORY_TO_TARGET_TYPE,
    TARGET_TYPE_TO_UPLOAD_CATEGORY,
    STORAGE_UPLOAD_CATEGORIES,
} from '../../config/configs/storage.config';
import { Public } from 'src/common/decorators';

@Controller('files')
@ApiTags('Files')
export class FilesController {
    constructor(
        private readonly filesService: FilesService,
        private readonly filePathsService: FilePathsService,
        private readonly fileUploadService: FileUploadService,
    ) {}

    @Get(':fileKey')
    @UseGuards(FileOwnerGuard)
    @ApiOperation({ summary: 'Get file by file key' })
    @ApiParam({
        name: 'fileKey',
        type: 'string',
        description: 'Unique file key identifier (UUID v4)',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'File successfully retrieved',
        content: {
            'application/octet-stream': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
            'image/jpeg': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
            'image/png': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'You can only access your own files',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Forbidden',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 403,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'File not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'File with key a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6 not found or deleted',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid UUID format',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Validation failed (uuid is expected)',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    description: 'Status code',
                    example: 400,
                },
            },
        },
    })
    async findByFileKey(
        @Param('fileKey', new ParseUUIDPipe({ version: '4' })) fileKey: string,
        @Res({ passthrough: true }) res: ExpressResponse,
    ): Promise<StreamableFile> {
        return this.fileUploadService.getFileStreamByFileKey(fileKey, res);
    }

    @Delete(':fileKey')
    @UseGuards(FileOwnerGuard)
    @ApiOperation({ summary: 'Delete file by file key' })
    @ApiParam({
        name: 'fileKey',
        type: 'string',
        description: 'Unique file key identifier (UUID v4)',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'File successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Success message',
                    example: 'File deleted successfully',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'You can only delete your own files',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Forbidden',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 403,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'File not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'File with key a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6 not found or deleted',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 404,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid UUID format',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Validation failed (uuid is expected)',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    description: 'Status code',
                    example: 400,
                },
            },
        },
    })
    async deleteByFileKey(@Param('fileKey', new ParseUUIDPipe({ version: '4' })) fileKey: string): Promise<{ message: string }> {
        await this.filesService.softDeleteByFileKey(fileKey, true);
        return { message: 'File deleted successfully' };
    }

    @Get('default/:targetType')
    @Public()
    @ApiOperation({ summary: 'Get default file URLs by target type' })
    @ApiParam({
        name: 'targetType',
        type: 'string',
        description: 'Target type for default files',
        enum: Object.values(STORAGE_UPLOAD_CATEGORIES),
        example: STORAGE_UPLOAD_CATEGORIES.projectAssets,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Default file URLs successfully retrieved',
        schema: {
            type: 'array',
            items: {
                type: 'string',
                description: 'File URL',
                example: 'https://example.com/assets/user-avatars/default-avatar.png',
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid target type or unsupported target type',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid target type: invalid-type. Supported types: user-avatars, project-assets',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 400,
                },
            },
        },
    })
    async getDefaultFileUrlsByTargetType(@Param('targetType') targetType: string): Promise<string[]> {
        const enumTargetType = UPLOAD_CATEGORY_TO_TARGET_TYPE[targetType];
        if (!enumTargetType) {
            throw new BadRequestException(
                `Invalid target type: ${targetType}. Supported types: ${Object.values(STORAGE_UPLOAD_CATEGORIES).join(', ')}`
            );
        }

        if (!this.filePathsService.isSupportedDefaultFiles(enumTargetType)) {
            const supportedTypes = this.filePathsService
                .getTargetTypesWithDefaultSupport()
                .map(type => TARGET_TYPE_TO_UPLOAD_CATEGORY[type]);

            throw new BadRequestException(
                `Target type '${targetType}' does not support default files. Supported types: ${supportedTypes.join(', ')}`
            );
        }

        return this.filesService.getDefaultFileUrlsByTargetType(enumTargetType);
    }
}
