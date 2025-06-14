// src/core/projects/dto/import-unsplash.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsName } from '../../../common/validators';
import { IsUrl } from 'class-validator';
import { IsUrlValue } from '../../../common/validators/url.validator';

export class ImportUnsplashDto {
    @ApiProperty({
        description: 'The download location of the Unsplash photo to import',
        example: 'https://api.unsplash.com/photos/yihlaRCCvd4/download?ixid=M3w3NTg1ODB8MHwxfHNlYXJjaHwxfHxkb2d8ZW58MHx8fHwxNzQ5OTA3MTk1fDA',
    })
    @IsUrlValue(false, false)
    downloadLocation: string;
}
