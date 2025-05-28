// src/core/files/validators/file-mime-type.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsMimeType, IsOptional, ValidateIf } from 'class-validator';

export function IsFileMimeType(
    isOptional: boolean,
    allowNull: boolean = false,
): PropertyDecorator {
    const decorators = [IsMimeType({ message: 'Invalid MIME type format' })];

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
