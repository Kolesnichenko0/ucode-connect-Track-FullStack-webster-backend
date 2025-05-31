// src/core/auth/auth.service.ts
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateRefreshTokenNonceDto } from '../refresh-token-nonces/dto/create-refresh-nonce.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { UsersService } from 'src/core/users/users.service';
import { RefreshTokenNoncesService } from 'src/core/refresh-token-nonces/refresh-token-nonces.service';
import { JwtTokensService } from '../jwt/jwt-tokens.service';
import { HashingPasswordsService } from '../users/hashing-passwords.service';
import { convertToSeconds, buildUrl } from '../../common/utils';
import { EmailService } from 'src/core/email/email.service';
import { generateNonce } from 'src/common/utils/nonce.utils';
import { User } from '../users/entities/user.entity';
import { ApiConfigService } from 'src/config/api-config.service';

@Injectable()
export class AuthService {
    private clientUrl: string;

    constructor(
        private readonly usersService: UsersService,
        private readonly refreshTokenNonceService: RefreshTokenNoncesService,
        private readonly jwtUtils: JwtTokensService,
        private readonly passwordService: HashingPasswordsService,
        private readonly emailService: EmailService,
        private readonly cs: ApiConfigService,
    ) {
        this.clientUrl = this.cs.get('app.clientUrl');
    }

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        this.sendConfirmationEmail(user);
        return { user: user };
    }

    private async sendConfirmationEmail(user: User) {
        const result = this.jwtUtils.generateToken(
            { sub: user.id },
            'confirmEmail',
        );
        const link = buildUrl(this.clientUrl, '/auth/confirm-email/', result);
        this.emailService.sendConfirmationEmail(
            user.email,
            link,
            `${user.firstName}${!user.lastName ? '' : user.lastName}`,
        );
    }

    async confirmEmail(userId: number) {
        await this.usersService.confirmEmail(userId);
        return { message: 'Email confirmed successfully' };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);

        const passwordValid = await this.passwordService.compare(
            loginDto.password,
            String(user.password),
        );

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        if (!user.isEmailVerified) {
            throw new ForbiddenException('User email is unverified');
        }

        const newNonce = generateNonce();

        const accessToken = this.jwtUtils.generateToken(
            { sub: user.id },
            'access',
        );
        const refreshToken = this.jwtUtils.generateToken(
            { sub: user.id, nonce: newNonce },
            'refresh',
        );

        await this.refreshTokenNonceService.create({
            userId: user.id,
            nonce: newNonce,
        } as CreateRefreshTokenNonceDto);

        return { user: await this.usersService.findByIdWithConfidential(user.id), accessToken, refreshToken };
    }

    async refreshAccessToken(
        userId: number,
        createdAt: number,
        refreshNonce: string,
    ) {
        const accessToken = this.jwtUtils.generateToken(
            { sub: userId },
            'access',
        );
        const time: number = new Date().getTime() / 1000;

        if (time - createdAt > convertToSeconds('1d')) {
            const newNonce = generateNonce();
            const newRefreshToken = this.jwtUtils.generateToken(
                { sub: userId, nonce: newNonce },
                'refresh',
            );

            await this.refreshTokenNonceService.create({
                userId: userId,
                nonce: newNonce,
            } as CreateRefreshTokenNonceDto);

            const nonceId: number = await this.refreshTokenNonceService
                .findByNonceAndUserId(userId, refreshNonce)
                .then((nonce) => nonce.id);
            await this.refreshTokenNonceService.deleteById(
                nonceId,
            );
            return { accessToken, newRefreshToken };
        }

        return { accessToken };
    }

    async logout(userId: number, refreshNonceDto: string) {
        const nonceEntity =
            await this.refreshTokenNonceService.findByNonceAndUserId(
                userId,
                refreshNonceDto,
            );
        if (!nonceEntity) {
            throw new NotFoundException(
                `Refresh token for user id ${userId} not found`,
            );
        }

        await this.refreshTokenNonceService.deleteById(
            nonceEntity.id,
        );
        return { message: 'Logged out successfully' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const user = await this.usersService.findByEmail(
            resetPasswordDto.email,
        );

        if (!user || !user.isEmailVerified) {
            throw new NotFoundException(
                'User with this email not found or you need verify your email',
            );
        }

        const passwordResetToken = this.jwtUtils.generateToken(
            { sub: user.id },
            'resetPassword',
        );

        const link = buildUrl(this.clientUrl, '/auth/reset-password/', passwordResetToken);

        this.emailService.sendResetPasswordEmail(
            user.email,
            link,
            `${user.firstName}${!user.lastName ? '' : user.lastName}`,
        );

        return { message: 'Password recovery email sent' };
    }

    async confirmNewPassword(newPasswordDto: NewPasswordDto, userId: number) {
        await this.usersService.resetPassword(
            userId,
            newPasswordDto.newPassword,
        );
        await this.refreshTokenNonceService.deleteByUserId(
            userId,
        );
        return { message: 'Password has been reset successfully' };
    }
}
