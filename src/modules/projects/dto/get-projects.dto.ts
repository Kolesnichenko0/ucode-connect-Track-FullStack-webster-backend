// src/modules/projects/dto/get-projects-cursor.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { BooleanTransform } from '../../../common/transformers/boolean.transformer';
import { IsBooleanField } from '../../../common/validators';
import { GetProjectsCursorDto } from './get-projects-cursor.dto';

export class GetProjectsDto extends GetProjectsCursorDto {
    @ApiProperty({ description: 'Filter by template status', required: false })
    @BooleanTransform()
    @IsBooleanField(true)
    is_template?: boolean;
}
