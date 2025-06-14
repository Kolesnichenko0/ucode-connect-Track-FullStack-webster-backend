import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { UnsplashService } from '../../core/unsplash/unsplash.service';
import { SearchPhotoDto } from './dto/search-photo.dto';
import { UnsplashPhotoResponse, UnsplashRateLimitInfo } from '../../core/unsplash/interfaces/unsplash.interfaces';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('photos')
export class PhotosController {
    constructor(private readonly unsplashService: UnsplashService) {}

    @Get('unsplash/search')
    @ApiOperation({
        summary: 'Search for photos on Unsplash',
        description: 'Performs a search on the Unsplash API using a query and returns a paginated list of photos.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieved a list of photos.',
        schema: {
            type: 'object',
            properties: {
                results: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: 'OzAeZ_R27YI' },
                            description: { type: 'string', example: 'a person standing on a rock in the middle of a lake' },
                            urls: { type: 'object' },
                            user: { type: 'object' },
                        },
                    },
                },
                total: { type: 'number', example: 10000 },
                totalPages: { type: 'number', example: 334 },
            },
        },
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid query parameters.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
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
    @ApiOperation({
        summary: 'Check Unsplash API rate limit status',
        description: 'Returns the current rate limit status for the Unsplash API, including the total limit and the number of remaining requests for the current hour.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieved the API rate limit status.',
        schema: {
            type: 'object',
            properties: {
                limit: { type: 'number', example: 50, description: 'Total requests allowed per hour.' },
                remaining: { type: 'number', example: 48, description: 'Requests remaining in the current hour.' },
                lastUpdated: { type: 'string', format: 'date-time', description: 'The time when the rate limit was last checked.' },
            },
        },
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    async searchUnsplashAvailableStatus(
    ): Promise<UnsplashRateLimitInfo | null> {
        return this.unsplashService.getRateLimitInfo();
    }
}
