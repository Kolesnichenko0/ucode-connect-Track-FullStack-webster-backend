// src/common/validators/enum-array.validator.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsEnumArray(enumType: any, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isEnumArray',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [enumType],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [enumType] = args.constraints;
                    if (!Array.isArray(value)) return false;
                    const enumValues = Object.values(enumType);
                    return value.every((item) => enumValues.includes(item));
                },
                defaultMessage(args: ValidationArguments) {
                    const [enumType] = args.constraints;
                    const enumValues = Object.values(enumType);
                    return `Each value in ${args.property} must be one of the following values: ${enumValues.join(', ')}`;
                },
            },
        });
    };
}
