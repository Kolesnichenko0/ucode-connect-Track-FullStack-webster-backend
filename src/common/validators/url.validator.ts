// src/common/validators/url.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsUrl, IsOptional, ValidateIf, ValidationOptions } from 'class-validator';

// Витягуємо тип для IsUrlOptions, як і раніше
type IsUrlOptions = Parameters<typeof IsUrl>[0];

/**
 * Custom decorator to validate a URL string.
 * It uses class-validator's @IsUrl under the hood.
 *
 * @param isOptional - If true, the field can be omitted.
 * @param allowNull - If true, the field can be null.
 * @param options - Options to pass to the underlying @IsUrl decorator.
 */
export function IsUrlValue(
    isOptional: boolean,
    allowNull: boolean = false,
    options: IsUrlOptions = {},
): PropertyDecorator {
    // ✅ КЛЮЧОВА ЗМІНА: Об'єднуємо специфічні опції та загальні (з повідомленням) в один об'єкт
    const combinedOptions: IsUrlOptions & ValidationOptions = {
        ...options, // Розгортаємо специфічні опції (напр., require_protocol)
        message: 'The provided value must be a valid URL.', // Додаємо загальну опцію message
    };

    // ✅ Передаємо тільки один об'єкт 'combinedOptions'
    const baseDecorator = IsUrl(combinedOptions);

    // Решта логіки залишається без змін
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
