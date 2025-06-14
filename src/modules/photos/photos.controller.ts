import { Controller, Get, Query } from '@nestjs/common';
import { UnsplashService } from '../../core/unsplash/unsplash.service';
import { SearchPhotoDto } from './dto/search-photo.dto';
import { UnsplashPhotoResponse, UnsplashRateLimitInfo } from '../../core/unsplash/interfaces/unsplash.interfaces';

@Controller('photos')
export class PhotosController {
    constructor(private readonly unsplashService: UnsplashService) {}

    @Get('unsplash/search')
    async searchUnsplashPhotos(
        @Query() searchPhotoDto: SearchPhotoDto,
    ): Promise<{
        results: UnsplashPhotoResponse[];
        total: number;
        totalPages: number;
    } | null> {
        return this.unsplashService.findPhotos(searchPhotoDto);
    }

    @Get('unsplash/available')
    async searchUnsplashAvailableStatus(
        @Query() searchPhotoDto: SearchPhotoDto,
    ): Promise<UnsplashRateLimitInfo | null> {
        return this.unsplashService.getRateLimitInfo();
    }
}
