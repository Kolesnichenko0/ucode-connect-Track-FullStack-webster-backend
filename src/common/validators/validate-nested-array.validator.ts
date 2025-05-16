// src/common/validators/validate-nested-array.validator.ts

import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
    ValidateNested,
    ArrayMinSize,
    IsOptional,
    ValidateIf,
    IsArray,
} from 'class-validator';

interface ValidateNestedArrayOptions {
    itemType: new (...args: any[]) => any;
    minSize?: number;
    isOptional?: boolean;
    allowNull?: boolean;
}

export function ValidateNestedArray(options: ValidateNestedArrayOptions): PropertyDecorator {
    const {
        itemType,
        minSize = 1,
        isOptional = false,
        allowNull = false,
    } = options;

    const baseDecorators = [
        IsArray({ message: '$property must be an array' }),
        ValidateNested({ each: true, message: 'Each element in $property must be valid $constraint1' }),
        Type(() => itemType),
        ArrayMinSize(minSize, { message: '$property must contain at least $constraint1 element(s)' }),
    ];

    if (allowNull) {
        return applyDecorators(
            ValidateIf((_, value) => value !== null),
            IsOptional(),
            ...baseDecorators,
        );
    }

    if (isOptional) {
        return applyDecorators(
            IsOptional(),
            ...baseDecorators,
        );
    }

    return applyDecorators(...baseDecorators);
}
