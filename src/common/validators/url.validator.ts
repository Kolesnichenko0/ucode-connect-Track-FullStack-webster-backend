// src/common/validators/url.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsUrl, IsOptional, ValidateIf, ValidationOptions } from 'class-validator';

type IsUrlOptions = Parameters<typeof IsUrl>[0];

export function IsUrlValue(
    isOptional: boolean,
    allowNull: boolean = false,
    options: IsUrlOptions = {},
): PropertyDecorator {
    const combinedOptions: IsUrlOptions & ValidationOptions = {
        ...options,
        message: 'The provided value must be a valid URL.',
    };

    const baseDecorator = IsUrl(combinedOptions);

    if (allowNull) {
        return applyDecorators(
            ValidateIf((_object, value) => value !== null),
            baseDecorator,
            IsOptional(),
        );
    } else if (isOptional) {
        return applyDecorators(
            IsOptional(),
            baseDecorator,
        );
    } else {
        return applyDecorators(baseDecorator);
    }
}
