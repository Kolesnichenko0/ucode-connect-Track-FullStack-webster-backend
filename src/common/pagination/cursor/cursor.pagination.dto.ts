// src/common/pagination/cursor/cursor.pagination.dto.ts
import {
    IsCursorPaginationAfter,
    IsCursorPaginationLimit,
    IsCursorType,
} from './cursor.pagination.validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseCursor, CursorType } from './cursor.pagination.types';

export class CursorPaginationDto<T extends BaseCursor> {
    @IsCursorPaginationAfter(true)
    @ValidateNested()
    after?: T;

    @IsCursorPaginationLimit(true)
    limit: number = 10;
}
