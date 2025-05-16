// src/common/validators/only-one-field.validator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

export function ValidateSingleFieldUpdate(
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'validateSingleFieldUpdate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const dto = args.object as any;
                    const definedFields = Object.entries(dto).filter(
                        ([_, value]) => value !== undefined,
                    );

                    return definedFields.length === 1;
                },
                defaultMessage(args: ValidationArguments) {
                    const dto = args.object as any;
                    const definedFields = Object.entries(dto).filter(
                        ([_, value]) => value !== undefined,
                    );

                    if (definedFields.length < 1) {
                        return 'At least one field must be provided';
                    } else if (definedFields.length > 1) {
                        return 'You can update one, but not multiple fields at the same time';
                    }

                    return 'Invalid field update';
                },
            },
        });
    };
}
