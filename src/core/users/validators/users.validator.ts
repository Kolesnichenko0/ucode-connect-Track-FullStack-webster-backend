// src/core/users/validators/users.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsStrongPassword, MaxLength } from 'class-validator';

export function IsPassword(isOptional: boolean) {
    const decorators = [
        IsStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        }),
        MaxLength(32),
    ];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
