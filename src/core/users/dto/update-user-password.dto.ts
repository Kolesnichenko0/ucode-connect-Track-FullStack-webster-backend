// src/core/users/dto/update-user-password.dto.ts
import { IsPassword } from '../validators/users.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserPasswordDto {
    @IsPassword(true)
    @ApiPropertyOptional({
        required: true,
        description:
            'Old password. Not required if user has no password set (e.g., registered via Google).',
        nullable: false,
        type: 'string',
        example: 'Password123!',
    })
    oldPassword?: string;

    @IsPassword(false)
    @ApiProperty({
        required: true,
        description: 'New Password',
        nullable: false,
        type: 'string',
        example: 'Password123!$',
    })
    newPassword: string;
}
