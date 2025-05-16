// src/common/validators/description.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsOptional, Length, IsString, ValidateIf } from 'class-validator';

export function IsDescription(
    isOptional: boolean,
    allowNull: boolean = false,
    minLength: number = 1,
    maxLength: number = 10000,
) {
    const baseDecorators = [IsString(), Length(minLength, maxLength)];

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
