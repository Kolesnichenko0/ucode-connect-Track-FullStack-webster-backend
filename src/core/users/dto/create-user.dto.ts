// src/core/users/dto/create-user.dto.ts
import { IsPassword } from '../validators/users.validator';
import { IsEnglishName } from '../../../common/validators/name.validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from '../../../common/validators/email.validator';

export class CreateUserDto {
    @IsEnglishName(false)
    @ApiProperty({
        required: true,
        description: 'First name',
        nullable: false,
        type: 'string',
        example: 'Ann',
    })
    firstName: string;

    @IsEnglishName(true)
    @ApiProperty({
        required: false,
        description: 'Last name',
        nullable: true,
        type: 'string',
        example: 'Nichols',
    })
    lastName?: string;

    @IsEmail(false)
    @ApiProperty({
        required: true,
        description: 'User email',
        nullable: false,
        type: 'string',
        example: 'ann.nichols@gmail.com',
    })
    email: string;

    @IsPassword(false)
    @ApiProperty({
        required: true,
        description: 'Password',
        nullable: false,
        type: 'string',
        example: 'Password123!$',
    })
    password: string;
}
