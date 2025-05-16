// src/core/auth/dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from '../../../common/validators/email.validator';

export class ResetPasswordDto {
    @IsEmail(false)
    @ApiProperty({
        description: 'User email',
        nullable: false,
        type: 'string',
        example: 'ann.nichols@gmail.com',
    })
    email: string;
}
