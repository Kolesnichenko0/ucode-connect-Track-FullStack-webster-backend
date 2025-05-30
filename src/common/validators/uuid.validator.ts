// src/common/validators/uuid.validator.ts
import { applyDecorators } from '@nestjs/common';
import { IsUUID, IsOptional, ValidateIf } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { validate as validateUuid, version as uuidVersion } from 'uuid';

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

/**
 * Декоратор параметра для проверки UUID формата
 * @param throwError - Выбрасывать ли исключение при невалидном UUID
 * @param version - Версия UUID
 * @returns ParameterDecorator
 */
export function IsUuidParam(
    throwError: boolean = true,
    version: '3' | '4' | '5' | 'all' = '4'
) {
    return function(target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const originalMethod = target[propertyKey];

        target[propertyKey] = function(...args: any[]) {
            const value = args[parameterIndex];

            // Если значение undefined или null, пропускаем проверку
            if (value === undefined || value === null) {
                return originalMethod.apply(this, args);
            }

            // Проверяем UUID
            const isValid = validateUuid(value);

            // Если нужно проверить версию и UUID валидный
            if (isValid && version !== 'all') {
                const detectedVersion = uuidVersion(value);
                if (detectedVersion !== parseInt(version)) {
                    if (throwError) {
                        throw new BadRequestException(`Parameter must be a valid UUID v${version}, but got v${detectedVersion}`);
                    }
                    return false;
                }
            }

            if (!isValid && throwError) {
                throw new BadRequestException(`Parameter must be a valid UUID`);
            }

            return originalMethod.apply(this, args);
        };
    };
}

