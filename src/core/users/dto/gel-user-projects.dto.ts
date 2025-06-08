// src/core/projects/dto/get-projects.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { IsBooleanField, IsName } from 'src/common/validators';

export class GetProjectsDto {
    @ApiProperty({ 
        description: 'Filter by template status',
        example: false,
        required: false 
    })
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBooleanField(true)
    is_template?: boolean;

    @ApiProperty({ 
        description: 'Search by project title', 
        example: 'design',
        required: false 
    })
    @IsName(true)
    title?: string;

    // @ApiProperty({ 
    //     description: 'Page number', 
    //     example: 1,
    //     required: false,
    //     default: 1 
    // })
    // @IsOptional()
    // @Transform(({ value }) => parseInt(value))
    // @IsInt()
    // @Min(1)
    // page?: number = 1;

    // @ApiProperty({ 
    //     description: 'Items per page', 
    //     example: 10,
    //     required: false,
    //     default: 10 
    // })
    // @IsOptional()
    // @Transform(({ value }) => parseInt(value))
    // @IsInt()
    // @Min(1)
    // limit?: number = 10;
}
