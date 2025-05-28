// src/core/files/validators/file-extension.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsOptional, ValidateIf, Matches } from 'class-validator';

export function IsFileExtension(
    isOptional: boolean,
    allowNull: boolean = false,
): PropertyDecorator {
    // or Matches(/^\.[a-zA-Z0-9]+$/, { message: 'Extension must start with a dot and contain alphanumeric characters' })
    const decorators = [Matches(/^[a-zA-Z0-9]+$/, { message: 'Extension can only contain alphanumeric characters' })];

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
