// src/common/validators/date.validator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments
} from 'class-validator';

export function IsLaterThan(
    property: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isLaterThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const relatedValue = (args.object as any)['startedAt'];
                    return new Date(value) >= new Date(relatedValue);
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} must be later than ${relatedPropertyName}`;
                },
            },
        });
    };
}

/**
 * Custom validator for ISO8601 date strings that provides more flexibility than the standard IsISO8601 validator.
 * 
 * @param isOptional - If true, allows the field to be undefined or null
 * @param allowNull - If true, allows the field to be null (default: false)
 * 
 * @example
 * class EventDto {
 *   @IsISO8601Date(false)
 *   startedAt: string;
 * 
 *   @IsISO8601Date(true)
 *   optionalDate?: string;
 * 
 *   @IsISO8601Date(false, true)
 *   nullableDate: string | null;
 * }
 */

export function IsISO8601Date(isOptional: boolean, allowNull: boolean = false) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsISO8601Date',
            target: object.constructor,
            propertyName: propertyName,
            options: {
                message: `${propertyName} must be a valid ISO 8601 date string. Example: 2025-01-01T00:00:00.000Z`,
            },
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (isOptional && (value === undefined || value === null)) {
                        return true;
                    }
                    
                    if (allowNull && value === null) {
                        return true;
                    }
                    
                    const date = new Date(value);
                    return !isNaN(date.getTime());
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid ISO 8601 date string`;
                },
            },
        });
    };
}

/**
 * Validator that checks if the difference between two dates is greater than the specified value in minutes.
 * @param property - The name of the property to compare with
 * @param minDifferenceMinutes - The minimum difference in minutes
 * @param validationOptions - Validation options
 */
export function IsTimeDifferenceGreaterThan(
    property: string,
    minDifferenceMinutes: number,
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isTimeDifferenceGreaterThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property, minDifferenceMinutes],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName, minDiffMinutes] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    
                    if (!value || !relatedValue) {
                        return true;
                    }
                    
                    const date1 = new Date(value);
                    const date2 = new Date(relatedValue);
                    
                    const differenceMs = Math.abs(date1.getTime() - date2.getTime());
                    const differenceMinutes = differenceMs / (60 * 1000);

                    return differenceMinutes >= minDiffMinutes;
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName, minDiffMinutes] = args.constraints;
                    return `${args.property} must be at least ${minDiffMinutes} minutes different from ${relatedPropertyName}`;
                },
            },
        });
    };
}