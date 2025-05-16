// src/common/validators/boolean.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsBoolean, IsOptional } from 'class-validator';

export function IsBooleanField(isOptional: boolean) {
    const decorators = [IsBoolean()];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
