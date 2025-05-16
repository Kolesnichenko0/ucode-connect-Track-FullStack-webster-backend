// src/core/auth/auth.controller.ts
import {
    Body,
    Controller,
    Post,
    UseGuards,
    HttpCode,
    Get,
    Req,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import {
    JwtRefreshGuard,
    JwtResetPasswordGuard,
    JwtConfirmEmailGuard,
} from './guards/auth.guards';
import { Request as ExpressRequest } from 'express';
import { UserId } from 'src/common/decorators/user.decorator';
import { RefreshTokenPayload } from 'src/common/decorators/refresh-token.decorator';
import {
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
    ApiBody,
    getSchemaPath,
} from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { Public } from '../../common/decorators';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Get('csrf-token')
    @ApiOperation({ summary: 'Get CSRF token' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful CSRF token generation',
        schema: {
            type: 'object',
            properties: {
                csrfToken: {
                    type: 'string',
                    description: 'New CSRF token',
                    example: 'lYCnPnjT-BUaydlZRpjPycsr_uMBMKtsGQNQ',
                },
            },
        },
    })
    async findCsrfToken(
        @Req() req: ExpressRequest,
    ): Promise<{ csrfToken: string }> {
        const token = req.csrfToken();
        return { csrfToken: token };
    }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'User registration' })
    @ApiBody({
        required: true,
        type: CreateUserDto,
        description: 'User registration data',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: User,
        description: 'Successful user registration',
        schema: {
            type: 'object',
            $ref: getSchemaPath(User),
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
                    description: 'Error message',
                    example: 'First name must be not empty',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'User data conflict',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Email already in use',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Conflict',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 409,
                },
            },
        },
    })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    //TODO: (not now) add email verification guard for 1 time use(redis)
    @Public()
    @Post('confirm-email/:confirm_token')
    @UseGuards(JwtConfirmEmailGuard)
    @ApiOperation({ summary: "Confirm the user's email by token" })
    @ApiParam({
        required: true,
        name: 'confirm_token',
        description: 'Email confirmation token',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImlzcyI6Ii9hcGkvYXV0aCIsImF1ZCI6Ii9hcGkiLCJpYXQiOjE3NDQxOTE3MDYsImV4cCI6MTc0NDI3ODEwNn0.N6VNvvW7SNw63imiPKlVILhkx9YVdwZ3pss_yKR_TLo',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful user email confirmation',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Success message',
                    example: 'Email confirmed successfully',
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
            },
        },
    })
    async confirmEmail(@UserId() userId: number) {
        return this.authService.confirmEmail(userId);
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiBody({
        required: true,
        type: LoginDto,
        description: 'User login credentials',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful login',
        type: User,
        schema: {
            type: 'object',
            properties: {
                user: { type: 'object', $ref: getSchemaPath(User) },
                accessToken: {
                    type: 'string',
                    description: 'Access token',
                    example:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIxLCJpc3MiOiIvYXBpL2F1dGgiLCJhdWQiOiIvYXBpIiwiaWF0IjoxNzQ0MTQ1NzQ0LCJleHAiOjE3NDQxNDY2NDR9.re-eZ9_6rsvPJQuE33o1cJK3UwL1ZCxmpLwn9T4-OJE',
                },
                refreshToken: {
                    type: 'string',
                    description: 'Refresh token',
                    example:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIxLCJub25jZSI6IjU4ZTNmNTFhMGI3MmI0ZTFiMWJhZTJlZDQ2MzFmOTU2IiwiaXNzIjoiL2FwaS9hdXRoIiwiYXVkIjoiL2FwaSIsImlhdCI6MTc0NDE0NTc0NCwiZXhwIjoxNzQ0NzUwNTQ0fQ.SPix1i2LRKESDXt3dKBysArWY0xZIxnJJ4tj8_G9ZyA',
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
                    type: 'array',
                    description: 'Error message',
                    example: [
                        'email must be an email',
                        'password is not strong enough',
                    ],
                },
                error: {
                    type: 'string',
                    description: 'Error type',
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
                    example: 'Invalid password',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
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
                    example: 'User with this email not found',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
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
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('/access-token/refresh')
    @UseGuards(JwtRefreshGuard)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiBody({
        required: true,
        description: 'User refresh token',
        schema: {
            type: 'object',
            properties: {
                refreshToken: {
                    type: 'string',
                    description: 'Refresh token',
                    example:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsIm5vbmNlIjoiYjBhMzYwYzRlZTZjMTZkMDg3ZTk0NzgzN2Q1MTRlY2YiLCJpc3MiOiIvYXBpL2F1dGgiLCJhdWQiOiIvYXBpIiwiaWF0IjoxNzQ0MTk0Nzk5LCJleHAiOjE3NDQ3OTk1OTl9.nQsdRxjNdPALu16Csut_Z5a_C4-P5SRKic83lhpO3kU',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Access token refreshed successfully',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    description: 'Access token',
                    example:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImlzcyI6Ii9hcGkvYXV0aCIsImF1ZCI6Ii9hcGkiLCJpYXQiOjE3NDQyMDAzMDAsImV4cCI6MTc0NDIwMTIwMH0.BhBcUxsL39o-gX2e4QmsbjpRHuu8-knNlq6gm96IhcA',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid token',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid or expired refresh token',
                },
                error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    description: 'Status Code',
                    example: 400,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Nonce not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Nonce for user not found',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
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
    async refreshAccessToken(
        @RefreshTokenPayload('nonce') nonce: string,
        @RefreshTokenPayload('createdAt') createdAt: number,
        @UserId() userId: number,
    ) {
        return this.authService.refreshAccessToken(userId, createdAt, nonce);
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtRefreshGuard)
    @ApiOperation({ summary: 'User logout' })
    @ApiBody({
        required: true,
        description: 'User refresh token',
        schema: {
            type: 'object',
            properties: {
                refreshToken: {
                    type: 'string',
                    description: 'Refresh token',
                    example:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsIm5vbmNlIjoiYjBhMzYwYzRlZTZjMTZkMDg3ZTk0NzgzN2Q1MTRlY2YiLCJpc3MiOiIvYXBpL2F1dGgiLCJhdWQiOiIvYXBpIiwiaWF0IjoxNzQ0MTk0Nzk5LCJleHAiOjE3NDQ3OTk1OTl9.nQsdRxjNdPALu16Csut_Z5a_C4-P5SRKic83lhpO3kU',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Successful logout',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Token missed',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Refresh token is missing',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'invalid_grant',
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
        status: HttpStatus.NOT_FOUND,
        description: 'Nonce not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Nonce for user not found',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
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
    async logout(
        @UserId() userId: number,
        @RefreshTokenPayload('nonce') nonce: string,
    ) {
        return this.authService.logout(userId, nonce);
    }

    @Public()
    @Post('reset-password')
    @ApiOperation({ summary: 'Send a password recovery email' })
    @ApiBody({
        required: true,
        type: ResetPasswordDto,
        description: 'Email for password reset',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Successful password recovery email sent',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Success message',
                    example: 'Password recovery email sent',
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
                    description: 'Error message',
                    example: 'Invalid user data',
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
                    example: 'User not found by email',
                },
            },
        },
    })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    //TODO: (not now) add guard for 1 time use(redis)
    @Public()
    @Post('reset-password/:confirm_token')
    @UseGuards(JwtResetPasswordGuard)
    @ApiOperation({ summary: 'Confirm password recovery by token' })
    @ApiParam({
        required: true,
        name: 'confirm_token',
        description: 'Password reset confirmation token',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImlzcyI6Ii9hcGkvYXV0aCIsImF1ZCI6Ii9hcGkiLCJpYXQiOjE3NDQyMDQwMzksImV4cCI6MTc0NDIwNzYzOX0.1TJP8A-z_hHyqFXew0199rH3XbsD9qjqXefv4kXhHZU',
    })
    @ApiBody({
        required: true,
        type: NewPasswordDto,
        description: 'New password data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful password update',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Success message',
                    example: 'Password has been reset successfully',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid data',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'array',
                    description: 'Error message',
                    example: [
                        'newPassword is not strong enough',
                        'newPassword must be shorter than or equal to 32 characters',
                    ],
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
    async confirmPasswordReset(
        @Body() newPasswordDto: NewPasswordDto,
        @UserId() userId: number,
    ) {
        return this.authService.confirmNewPassword(newPasswordDto, userId);
    }
}
