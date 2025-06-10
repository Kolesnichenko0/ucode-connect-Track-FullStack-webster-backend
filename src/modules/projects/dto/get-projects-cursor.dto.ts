// src/core/projects/dto/get-projects.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsName } from 'src/common/validators';
import { CursorPaginationDto, CursorType, ProjectCursor } from '../../../common/pagination/cursor';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProjectsCursorDto extends CursorPaginationDto<ProjectCursor>{
    @ApiProperty({
        description: 'Cursor for pagination. Object with `id` and `updatedAt` of the last project.',
        required: false,
        type: () => ProjectCursor,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => ProjectCursor)
    declare after?: ProjectCursor;

    @ApiProperty({ description: 'Search by project title', required: false })
    @IsName(true, false)
    title?: string;
}
