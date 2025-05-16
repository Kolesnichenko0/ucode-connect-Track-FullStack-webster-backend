// src/core/auth/dto/new-password.dto.ts
import { IsPassword } from '../../users/validators/users.validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewPasswordDto {
    @IsPassword(false)
    @ApiProperty({
        description: 'New password',
        nullable: false,
        type: 'string',
        example: 'NewPassword123!$',
    })
    newPassword: string;
}
