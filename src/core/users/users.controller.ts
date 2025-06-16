// src/core/users/users.controller.ts
import {
    Controller,
    Body,
    Param,
    Patch,
    UseGuards,
    Get,
    HttpStatus,
    Post,
    UseInterceptors,
    UploadedFile,
    ParseFilePipeBuilder,
    Req,
    Query,
    Delete,
    ParseUUIDPipe,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { AccountOwnerGuard } from './guards/account-owner.guard';
import { UserId } from '../../common/decorators';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import {
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
    OmitType,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    UploadFileTypeValidator,
    UploadFileSizeValidator,
} from '../file-upload/validators';
import {
    UPLOAD_ALLOWED_FILE_MIME_TYPES,
    UPLOAD_ALLOWED_FILE_EXTENSIONS,
    UPLOAD_ALLOWED_MAX_FILE_SIZES,
} from '../file-upload/constants/file-upload.contsants';
import { ProjectsService } from '../../modules/projects/projects.service';
import { GetProjectsCursorDto } from '../../modules/projects/dto/get-projects-cursor.dto';
import { Project } from '../../modules/projects/entities/project.entity';

import { FileOwnerGuard } from '../files/guards/file-owner.guard';
import {
    CursorPaginationResult,
    ProjectCursor,
} from '../../common/pagination/cursor';
import { AfterCursorQueryParseInterceptor } from '../../common/interceptors/after-cursor.interceptor';
import { ExternalAccount } from '../external-accounts/entities/external-account.entity';
import { ExternalAccountsService } from '../external-accounts/external-accounts.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly projectsService: ProjectsService,
        private readonly externalAccountsService: ExternalAccountsService,
    ) {}

    @Get('me')
    @ApiOperation({ summary: 'Get current user data' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: User,
        description: 'Successfully retrieved current user profile',
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
    async findMe(@UserId() userId: number): Promise<User> {
        return await this.usersService.findByIdWithConfidential(userId);
    }

    @Get(':id')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Get user data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: () => OmitType(User, []),
        description: 'Successfully retrieve',
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
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User not found',
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
    async findById(@Param('id') id: number): Promise<User> {
        return await this.usersService.findByIdWithoutPassword(id);
    }

    @Get(':id/password/status')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Check if user has password set' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password status successfully retrieved',
        schema: {
            type: 'object',
            properties: {
                hasPassword: {
                    type: 'boolean',
                    description: 'Whether user has password set for login',
                    example: true,
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
                    example: 'You can only access your own account',
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
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User not found',
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
    async checkPasswordStatus(
        @Param('id') id: number,
    ): Promise<{ hasPassword: boolean }> {
        return this.usersService.checkPasswordStatus(id);
    }

    @Get(':id/projects')
    @UseGuards(AccountOwnerGuard)
    @UseInterceptors(AfterCursorQueryParseInterceptor)
    @ApiOperation({ summary: 'Get user projects' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'User ID',
        example: 1,
    })
    @ApiQuery({
        name: 'is_template',
        type: 'boolean',
        description: 'Filter by template status',
        example: false,
        required: false,
    })
    @ApiQuery({
        name: 'title',
        type: 'string',
        description: 'Search by project title',
        example: 'design',
        required: false,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User projects successfully retrieved',
        schema: {
            type: 'object',
            properties: {
                projects: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Project' },
                },
                total: { type: 'number', example: 25 },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied',
    })
    async findUserProjects(
        @Param('id') id: number,
        @Query() query: GetProjectsCursorDto,
    ): Promise<CursorPaginationResult<Project, ProjectCursor>> {
        await this.usersService.findById(id);

        return this.projectsService.findByAuthorId(id, query);
    }

    @Get(':id/external-accounts')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Get user external accounts' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: [ExternalAccount],
        description: 'Successfully retrieved user external accounts',
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
                    example: 'You can only access your own account',
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
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User not found',
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
    async findUserExternalAccounts(
        @Param('id') id: number,
    ): Promise<ExternalAccount[]> {
        return this.externalAccountsService.findAllByUserId(id);
    }

    @Patch(':id')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Update user data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: UpdateUserDto,
        description: 'User update data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: User,
        description: 'Successfully update',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: [
                        'firstName must match /^[a-zA-Z-]+$/ regular expression',
                    ],
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
                    example: 'You can only access your own account',
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
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateUserDto,
        @UserId() userId: number,
    ): Promise<User> {
        return await this.usersService.update(id, dto);
    }

    @Patch(':id/password')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Update user password data' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: UpdateUserPasswordDto,
        description: 'User password update data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: User,
        description: 'Successfully update',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: [
                        'oldPassword is not strong enough',
                        'newPassword is not strong enough',
                    ],
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
                    example: 'Old password does not match',
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
                    example: 'You can only access your own account',
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
    async updatePassword(
        @Param('id') id: number,
        @Body() dto: UpdateUserPasswordDto,
    ): Promise<User> {
        return this.usersService.setOrUpdatePassword(id, dto);
    }

    @Post(':id/upload-avatar')
    @UseGuards(AccountOwnerGuard)
    @UseInterceptors(FileInterceptor('avatar'))
    @ApiOperation({ summary: 'Upload user profile picture' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiBody({
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'Avatar image file (e.g., PNG, JPEG). Example: "avatar.png" (max size: 5MB)',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: User,
        description: 'Successfully retrieved user profile',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Only allowed file types are accepted!',
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
                    example: 'You can only access your own account',
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
    async uploadAvatar(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addValidator(
                    new UploadFileTypeValidator({
                        allowedMimeTypes: [
                            ...UPLOAD_ALLOWED_FILE_MIME_TYPES.USER_AVATAR,
                        ],
                        allowedExtensions: [
                            ...UPLOAD_ALLOWED_FILE_EXTENSIONS.USER_AVATAR,
                        ],
                    }),
                )
                .addValidator(
                    new UploadFileSizeValidator({
                        maxSize: UPLOAD_ALLOWED_MAX_FILE_SIZES.USER_AVATAR,
                    }),
                )
                .build(),
        )
        file: Express.Multer.File,
        @Param('id') id: number,
        @UserId() authorId: number,
        @Req() req: Request,
    ): Promise<User> {
        return this.usersService.updateUserAvatar(id, file);
    }

    @Delete(':id/avatar/:fileKey')
    @UseGuards(AccountOwnerGuard, FileOwnerGuard)
    @ApiOperation({ summary: 'Delete user avatar and restore default' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiParam({
        required: true,
        name: 'fileKey',
        type: 'string',
        description: 'Avatar file key to delete',
        example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: User,
        description: 'Avatar successfully deleted and default restored',
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
                    example:
                        'File with key a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6 not found or deleted',
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
                    example: 'You can only access your own account',
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
    async deleteAvatar(
        @Param('id') id: number,
        @Param('fileKey', new ParseUUIDPipe({ version: '4' })) fileKey: string,
    ): Promise<User> {
        return this.usersService.deleteUserAvatar(id, fileKey);
    }

    @Delete(':id')
    @UseGuards(AccountOwnerGuard)
    @ApiOperation({ summary: 'Delete user account permanently' })
    @ApiParam({
        required: true,
        name: 'id',
        type: 'number',
        description: 'User identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'User account successfully deleted',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User not found',
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
                    example: 'You can only access your own account',
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
    async delete(@Param('id') id: number): Promise<void> {
        await this.usersService.delete(id);
    }
}
