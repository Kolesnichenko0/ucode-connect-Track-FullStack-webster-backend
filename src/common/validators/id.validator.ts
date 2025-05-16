// src/common/validators/id.validator.ts
import { applyDecorators } from '@nestjs/common';
import {
    IsArray,
    IsInt,
    IsOptional,
    IsPositive,
    ValidateIf,
} from 'class-validator';

export function IsId(isOptional: boolean, allowNull: boolean = false) {
    const decorators = [IsInt(), IsPositive()];

    if (allowNull) {
        return applyDecorators(
            ValidateIf((value) => value !== null),
            ...decorators,
            IsOptional(),
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}

export function IsIdArray(isOptional: boolean) {
    const decorators = [
        IsArray(),
        IsInt({ each: true }),
        IsPositive({ each: true }),
    ];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
