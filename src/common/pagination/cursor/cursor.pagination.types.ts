// src/common/pagination/cursor/cursor.pagination.types.ts
import {IsISO8601Date, IsId} from '../../validators';

export class BaseCursor {
    @IsId(false, true)
    id: number;
}

export class EventCursor extends BaseCursor {
    @IsISO8601Date(false, true)
    createdAt: string;
}

export enum CursorType {
    EVENT = 'event',
}

export interface CursorPaginationResult<T, C> {
    items: T[];
    nextCursor: C | null;
    hasMore: boolean;
    total: number;
    remaining: number;
}

export interface CursorConfig<T, C extends BaseCursor> {
    cursorFields: (keyof C)[];
    entityAliases: Record<keyof C, string>;
    sortDirections?: Record<keyof C, "ASC" | "DESC">;

    getFieldValue?: (item: T, field: keyof C) => any;
    fieldTypes?: Partial<Record<keyof C, "date" | "number" | "string">>;

    debug?: boolean;
    customConditionBuilder?: (
        after: C,
        config: CursorConfig<T, C>
    ) => { conditions: string; parameters: Record<string, any> };
}
