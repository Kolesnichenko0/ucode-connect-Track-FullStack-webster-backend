// src/common/validators/percent.validator.ts
import { IsNumber, IsOptional, Max, Min, ValidateIf } from 'class-validator';
import { applyDecorators } from '@nestjs/common';

export function IsPercent(
    isOptional: boolean,
    allowNull: boolean = false,
    min: number = 0,
    max: number = 1,
    maxDecimalPlaces: number = 4
) {
    const baseDecorators = [
        IsNumber({ maxDecimalPlaces }),
        Min(min),
        Max(max),
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
