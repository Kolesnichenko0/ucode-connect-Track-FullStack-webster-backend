// src/common/pagination/offset/offset.pagination.dto.ts
import {IsOffsetPaginationPage, IsOffsetPaginationLimit} from "./offset.pagination.validator";

export class OffsetPaginationDto {
    @IsOffsetPaginationPage(true)
    page: number = 1;

    @IsOffsetPaginationLimit(true)
    limit: number = 10;
}
