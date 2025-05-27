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
    ApiResponse,
    ApiTags,
    OmitType,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
    UploadFileTypeValidator, 
    UploadFileSizeValidator,
    UPLOAD_ALLOWED_FILE_MIME_TYPES,
    UPLOAD_ALLOWED_MAX_FILE_SIZES,
    UPLOAD_ALLOWED_FILE_EXTENSIONS 
  } from '../../core/file-upload';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
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
                }
            },
        },
    })
    async updatePassword(
        @Param('id') id: number,
        @Body() dto: UpdateUserPasswordDto,
    ): Promise<User> {
        return this.usersService.updatePassword(id, dto);
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
        description: 'Avatar successfully uploaded',
        schema: {
            type: 'object',
            properties: {
                server_filename: {
                    type: 'string',
                    description: 'Filename for the uploaded avatar',
                    example: 'avatar.png',
                },
                fileKey: {
                    type: 'string',
                    description: 'Unique file key for the uploaded avatar',
                    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
                },
            },
        },
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
                    new UploadFileTypeValidator({allowedMimeTypes: [...UPLOAD_ALLOWED_FILE_MIME_TYPES.USER_AVATAR], allowedExtentions: [...UPLOAD_ALLOWED_FILE_EXTENSIONS.USER_AVATAR]}),
                )
                .addValidator(
                    new UploadFileSizeValidator({maxSize: UPLOAD_ALLOWED_MAX_FILE_SIZES.USER_AVATAR})
                )
                .build(),
        ) file: Express.Multer.File,
        @Param('id') id: number,
        @UserId() authorId: number,
        @Req() req: Request,
    ): Promise<User> {
        return this.usersService.updateUserAvatar(id, file);
    }
}
