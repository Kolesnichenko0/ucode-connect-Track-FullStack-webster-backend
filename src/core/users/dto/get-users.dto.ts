// src/core/users/dto/get-user.dto.ts
import { IsEmail } from '../../../common/validators/email.validator';
import { ApiProperty, ApiQuery } from '@nestjs/swagger';

export class GetUsersDto {
    @IsEmail(false)
    @ApiProperty({
        required: true,
        type: String,
        description: 'Email address of the user to retrieve',
        example: 'ann.nichols@gmail.ua',
    })
    email: string;
}
