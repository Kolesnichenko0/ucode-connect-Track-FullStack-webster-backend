// src/common/validators/email.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsEmail as ClassValidatorIsEmail, IsOptional } from 'class-validator';

export function IsEmail(isOptional: boolean = false) {
    const decorators = [ClassValidatorIsEmail()];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    } else {
        return applyDecorators(...decorators);
    }
}
