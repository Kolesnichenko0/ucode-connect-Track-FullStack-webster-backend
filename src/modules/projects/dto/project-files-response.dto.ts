// src/core/projects/dto/project-files-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { File } from '../../../core/files/entities/file.entity'

export class ProjectFilesResponseDto {
    @ApiProperty({
        description: 'Array of project files',
        type: [File]
    })
    files: { fileKey: string, url: string }[];

    @ApiProperty({ description: 'Total count of files', example: 5 })
    total: number;
}
