// src/common/validators/enum.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsOptional, ValidateIf } from 'class-validator';

export function IsEnumValue<T extends object>(
    enumType: T,
    isOptional: boolean,
    allowNull: boolean = false
): PropertyDecorator {
    const decorators = [IsEnum(enumType)];

    if (allowNull) {
        return applyDecorators(
            ValidateIf((value) => value !== null),
            ...decorators,
            IsOptional()
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
