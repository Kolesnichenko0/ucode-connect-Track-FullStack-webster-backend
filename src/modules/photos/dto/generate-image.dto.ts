// src/core/photos/dto/generate-image.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsName } from '../../../common/validators';

export class GenerateImageDto {
    @ApiProperty({ description: 'Text prompt for AI image generation', example: 'A cat in a space suit' })
    @IsName(false, false, 1, 1000)
    prompt: string;
}
