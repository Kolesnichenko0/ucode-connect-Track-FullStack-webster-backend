// src/modules/projects/entities/project.entity.ts
import { Expose } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Project as PrismaProject } from '@prisma/client';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    DETAILED: ['basic', 'detailed'],
    FULL: ['basic', 'detailed', 'full'],
};

export class Project implements PrismaProject {
    @ApiProperty({ description: 'Project ID', example: 1 })
    @Expose({ groups: ['basic'] })
    id: number;

    @ApiProperty({ description: 'Project name', example: 'My Design Project' })
    @Expose({ groups: ['basic'] })
    title: string;

    @ApiProperty({ description: 'Project type', example: 'instagram' })
    @Expose({ groups: ['basic'] })
    type: string

    @ApiProperty({
        description: 'Project description',
        example: 'A beautiful design project',
        required: false
    })
    @Expose({ groups: ['basic'] })
    description: string | null;

    @ApiProperty({ description: 'Project JSON content' })
    @Expose({ groups: ['detailed'] })
    content: any;

    @ApiProperty({ description: 'Preview file ID', example: 1 })
    @Expose({ groups: ['full'] })
    previewFileId: number;

    @ApiProperty({
        description: 'Author ID (null for system templates)',
        example: 1,
        required: false
    })
    @Expose({ groups: ['basic'] })
    authorId: number | null;

    @ApiProperty({ description: 'Is template project', example: false })
    @Expose({ groups: ['basic'] })
    isTemplate: boolean;

    @ApiProperty({ description: 'Creation date' })
    @Expose({ groups: ['basic'] })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    @Expose({ groups: ['basic'] })
    updatedAt: Date;

    @ApiProperty({
        description: 'Preview image URL',
        example: 'https://api.example.com/files/abc-123-def.png'
    })
    @Expose({ groups: ['basic'] })
    previewUrl?: string;
}

export class ProjectWithBasic extends PickType(Project, [
    'id',
    'title',
    'description',
    'isTemplate',
    'createdAt',
    'updatedAt',
    'previewUrl',
] as const) {}
