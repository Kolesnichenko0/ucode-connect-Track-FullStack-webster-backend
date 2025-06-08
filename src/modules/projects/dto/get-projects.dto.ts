// src/core/projects/dto/get-projects.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { BooleanTransform } from 'src/common/transformers/boolean.transformer';
import { IsBooleanField, IsName } from 'src/common/validators';

export class GetProjectsDto {
    @ApiProperty({
        description: 'Filter by template status',
        example: false,
        required: false
    })
    @BooleanTransform()
    @IsBooleanField(true)
    is_template?: boolean;

    @ApiProperty({
        description: 'Search by project title',
        example: 'design',
        required: false
    })
    @IsName(true, false)
    title?: string;
}
