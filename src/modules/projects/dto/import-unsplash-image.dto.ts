// src/core/projects/dto/import-unsplash.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsName } from '../../../common/validators';

export class ImportUnsplashDto {
    @ApiProperty({
        description: 'The ID of the Unsplash photo to import',
        example: 'NMqck8kZYiE',
    })
    @IsName(false, false)
    photoId: string;
}
