// src/common/validators/uuid.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsUUID, IsOptional, ValidateIf } from 'class-validator';

export function IsUuidValue(
    isOptional: boolean,
    allowNull: boolean = false,
    version: '3' | '4' | '5' | 'all' = '4',
): PropertyDecorator {
    const decorators = [IsUUID(version, { message: 'Invalid UUID format' })];

    if (allowNull) {
        return applyDecorators(
            ValidateIf((_object, value) => value !== null),
            ...decorators,
            IsOptional()
        );
    } else if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
