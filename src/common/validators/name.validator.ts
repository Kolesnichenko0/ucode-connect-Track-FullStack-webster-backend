// src/common/validators/name.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString, Length, Matches, ValidateIf } from 'class-validator';

export function IsName(
    isOptional: boolean,
    allowNull: boolean = false,
    minLength: number = 1,
    maxLength: number = 100,
) {
    const baseDecorators = [
        IsString(),
        Length(minLength, maxLength),
    ];

    if (allowNull) {
        return applyDecorators(
            ValidateIf((value) => value !== null),
            ...baseDecorators,
            IsOptional(),
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...baseDecorators);
    } else {
        return applyDecorators(...baseDecorators);
    }
}

export function IsEnglishName(isOptional: boolean, allowNull: boolean = false) {
    const baseDecorators = [Matches(/^[a-zA-Z-]+$/), Length(3, 100)];

    if (allowNull) {
        return applyDecorators(
            ValidateIf((value) => value !== null),
            ...baseDecorators,
            IsOptional(),
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...baseDecorators);
    } else {
        return applyDecorators(...baseDecorators);
    }
}

export function IsEnglishNameWithNumbers(
    isOptional: boolean,
    allowNull: boolean = false,
    minLength: number = 3,
    maxLength: number = 100
) {
    const baseDecorators = [
        Matches(/^[a-zA-Z0-9_-]+$/, {
            message: 'Value can only contain English letters, numbers, and hyphens'
        }),
        Length(minLength, maxLength)
    ];

    if (allowNull) {
        return applyDecorators(
            ValidateIf((value) => value !== null),
            ...baseDecorators,
            IsOptional(),
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...baseDecorators);
    } else {
        return applyDecorators(...baseDecorators);
    }
}
