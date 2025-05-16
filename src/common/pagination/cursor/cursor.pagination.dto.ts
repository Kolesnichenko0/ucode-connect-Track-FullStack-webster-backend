// src/common/pagination/cursor/cursor.pagination.dto.ts
import {
    IsCursorPaginationAfter,
    IsCursorPaginationLimit,
    IsCursorType
} from "./cursor.pagination.validator";
import {ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {BaseCursor, CursorType, EventCursor} from "./cursor.pagination.types";

export class CursorPaginationDto {
    @IsCursorType(false)
    type: CursorType;

    @IsCursorPaginationAfter(true)
    @ValidateNested()
    @Type(options => {
        if (options?.object && 'type' in options.object) {
            switch (options.object.type) {
                case CursorType.EVENT:
                    return EventCursor;
                default:
                    return EventCursor;
            }
        }
        return EventCursor;
    })
    after?: BaseCursor;

    @IsCursorPaginationLimit(true)
    limit: number = 10;
}
