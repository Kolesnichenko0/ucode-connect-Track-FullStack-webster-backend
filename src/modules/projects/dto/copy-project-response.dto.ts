// src/core/projects/dto/copy-project-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CopyProjectResponseDto {
    @ApiProperty({ description: 'New project ID', example: 123 })
    projectId: number;

    @ApiProperty({ description: 'Success message', example: 'Project copied successfully' })
    message: string;
}
