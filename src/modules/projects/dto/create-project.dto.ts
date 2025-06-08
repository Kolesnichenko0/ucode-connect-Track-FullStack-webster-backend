// src/modules/projects/dto/create-project.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBooleanField, IsName, IsDescription } from 'src/common/validators';
import { IsObjectField } from 'src/common/validators/object.validator';

export class CreateProjectDto {
    @ApiProperty({ description: 'Project name', example: 'My Design Project' })
    @IsName(false)
    title: string;

    @ApiProperty({
        description: 'Project description',
        example: 'A beautiful design project',
        required: false
    })
    @IsDescription(false)
    description?: string | null;

    @ApiProperty({ description: 'Project JSON content with canvas data' })
    @IsObjectField(false)
    content: object;

    @ApiProperty({
        description: 'Is template project',
        example: false,
        required: false,
        default: false
    })
    @IsBooleanField(true)
    isTemplate?: boolean = false;
}
