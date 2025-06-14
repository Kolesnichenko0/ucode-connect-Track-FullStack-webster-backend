import { UnsplashOrientation, UnsplashSearchOptions } from '../../../core/unsplash/interfaces/unsplash.interfaces';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsEnumValue, IsName } from '../../../common/validators';

export class SearchPhotoDto implements UnsplashSearchOptions{
    @ApiProperty({ description: 'Search query', example: 'mountains' })
    @IsName(false, true)
    query: string;

    @ApiProperty({
        description: 'Filter by photo orientation',
        required: false,
        enum: UnsplashOrientation,
        example: UnsplashOrientation.LANDSCAPE,
    })
    @IsEnumValue(UnsplashOrientation, true, false)
    orientation?: UnsplashOrientation;
}
