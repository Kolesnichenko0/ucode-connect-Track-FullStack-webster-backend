// src/common/pagination/cursor/cursor.pagination.dto.ts
import {IsInt, IsOptional, Max, IsPositive, IsObject, IsEnum} from 'class-validator';
import {applyDecorators} from '@nestjs/common';
import {CursorType} from "./cursor.pagination.types";

export function IsCursorType(isOptional: boolean) {
    const decorators = [
        IsEnum(CursorType),
    ];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    }
    return applyDecorators(...decorators);
}

export function IsCursorPaginationAfter(isOptional: boolean) {
    const decorators = [
        IsObject()
    ];

    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    }
    return applyDecorators(...decorators);
}

export function IsCursorPaginationLimit(isOptional: boolean, maxLimit = 100) {
    const decorators = [IsInt(), IsPositive(), Max(maxLimit, {message: `Limit must not exceed ${maxLimit}`}),];
    if (isOptional) {
        return applyDecorators(IsOptional(), ...decorators);
    }
    return applyDecorators(...decorators);
}
