// src/core/auth/dto/login.dto.ts
import { IsPassword } from '../../users/validators/users.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from '../../../common/validators/email.validator';

export class LoginDto {
    @IsEmail(false)
    @ApiProperty({
        description: 'User email',
        nullable: false,
        type: 'string',
        example: 'ann.nichols@gmail.com',
    })
    email: string;

    @IsPassword(false)
    @ApiProperty({
        description: 'Password',
        nullable: false,
        type: 'string',
        example: 'Password123!$',
    })
    password: string;
}
