import { IsObject, IsOptional, ValidateIf } from "class-validator";
import { applyDecorators } from '@nestjs/common';

export function IsObjectField(
    isOptional: boolean,
    allowNull: boolean = false,
) {
    const baseDecorators = [
        IsObject()
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