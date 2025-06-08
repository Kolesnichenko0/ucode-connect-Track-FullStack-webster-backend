// src/modules/projects/dto/update-project.dto.ts
import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(
    OmitType(CreateProjectDto, [] as const)
) {
    @ApiProperty({ description: 'Preview file id', example: 1 })
    previewFileId?: number;
}
