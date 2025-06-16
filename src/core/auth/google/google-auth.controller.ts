// src/core/auth/google/google-auth.controller.ts
import { Controller, Get, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Public, UserId } from '../../../common/decorators';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoogleAuthService } from './google-auth.service';
import { ApiConfigService } from '../../../config/api-config.service';
import { GoogleAuthGuard } from './guards/google-auth.guards';

@Controller('auth/google')
@ApiTags('Auth')
export class GoogleAuthController {
    constructor(
        private readonly googleAuthService: GoogleAuthService,
        private readonly cs: ApiConfigService,
    ) {}

    @Public()
    @Get()
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
    @ApiResponse({
        status: HttpStatus.FOUND,
        description: 'Redirects to Google for authentication.',
    })
    googleAuthRedirect() {}

    @Public()
    @Get('callback')
    @UseGuards(GoogleAuthGuard)
    @ApiOperation({ summary: 'Google OAuth2 callback handler' })
    @ApiResponse({
        status: HttpStatus.FOUND,
        description:
            'Redirects to the client application with access and refresh tokens.',
    })
    async googleAuthCallback(@UserId() userId: number, @Res() res: Response) {
        const { accessToken, refreshToken } =
            await this.googleAuthService.login(userId);

        const clientUrlAfterExternalAuth = this.cs.get(
            'app.clientUrlAfterExternalAuth',
        );

        const redirectUrl = new URL(clientUrlAfterExternalAuth);
        redirectUrl.searchParams.set('accessToken', accessToken);
        redirectUrl.searchParams.set('refreshToken', refreshToken);

        res.redirect(HttpStatus.FOUND, redirectUrl.toString());
    }
}
