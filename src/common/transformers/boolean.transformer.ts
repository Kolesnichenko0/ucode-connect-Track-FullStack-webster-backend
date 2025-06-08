// src/common/transformers/boolean.transformer.ts
import { Transform, TransformFnParams } from 'class-transformer';

export interface BooleanTransformOptions {
    trueValues?: string[];
    falseValues?: string[];
    defaultValue?: boolean;
}

export function BooleanTransform(options: BooleanTransformOptions = {}) {
    const {
        trueValues = ['true', '1'],
        falseValues = ['false', '0'],
        defaultValue = undefined
    } = options;

    return Transform(({ obj, key }: TransformFnParams) => {
        const value = obj[key];
        
        if (value === undefined || value === null || value === '') {
            return defaultValue;
        }
        
        if (trueValues.includes(String(value))) {
            return true;
        }
        
        if (falseValues.includes(String(value))) {
            return false;
        }
        
        return defaultValue ? defaultValue : value;
    });
}