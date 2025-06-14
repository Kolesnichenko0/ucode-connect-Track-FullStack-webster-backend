// src/core/projects/dto/copy-project-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AddUnsplashPhotoResponseDto {
    fileId: number;

    url: string;

    fileKey: string;
}
