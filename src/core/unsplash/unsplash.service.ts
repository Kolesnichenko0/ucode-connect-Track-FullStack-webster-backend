// src/core/unsplash/services/unsplash.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { createApi } from 'unsplash-js';
import { ApiResponse } from 'unsplash-js/dist/helpers/response';
import { Random, Basic } from 'unsplash-js/dist/methods/photos/types';
import { ApiConfigService } from '../../config/api-config.service';
import { Readable } from 'stream';
import {
    UnsplashPhotoResponse,
    UnsplashSearchOptions,
    UnsplashRandomPhotoOptions,
    UnsplashRateLimitInfo,
    UnsplashImageOptions,
    UnsplashPhotoDownloadInfo,
} from './interfaces/unsplash.interfaces';
import { downloadFileFromUrl, getFileExtension } from '../../common/utils';
import * as mime from 'mime-types';

@Injectable()
export class UnsplashService {
    private readonly UNSPLASH_API_RATE_LIMIT_MESSAGE: string =
        'Approaching Unsplash API rate limit. Please wait before making more requests.';
    private unsplash;
    private lastRateLimitInfo: UnsplashRateLimitInfo | null = null;

    constructor(private readonly cs: ApiConfigService) {
        this.unsplash = createApi({
            accessKey: this.cs.get('unsplash.accessKey'),
        });
    }

    async findRandomPhotos(
        options: UnsplashRandomPhotoOptions,
    ): Promise<UnsplashPhotoResponse[] | null> {
        try {
            if (this.isApproachingRateLimit()) {
                console.log(this.UNSPLASH_API_RATE_LIMIT_MESSAGE);
                return null;
            }

            const response: ApiResponse<Random> =
                await this.unsplash.photos.getRandom({
                    query: options.query,
                    orientation: options.orientation,
                    count: options.count || 1,
                    collections: options.collections,
                    content_filter: options.contentFilter,
                    featured: options.featured,
                });

            this.updateRateLimitInfo(response);

            if (response.errors) {
                console.error('Unsplash API errors:', response.errors);
                return null;
            }

            if (!response.response) {
                return null;
            }

            const photos = Array.isArray(response.response)
                ? response.response
                : [response.response];

            return photos.map(this.mapPhotoResponse);
        } catch (error) {
            console.error('Error fetching random photos from Unsplash:', error);
            return null;
        }
    }

    async findPhotos(options: UnsplashSearchOptions): Promise<{
        results: UnsplashPhotoResponse[];
        total: number;
        totalPages: number;
    } | null> {
        try {
            if (this.isApproachingRateLimit()) {
                console.log(this.UNSPLASH_API_RATE_LIMIT_MESSAGE);
                return null;
            }

            const response: ApiResponse<any> =
                await this.unsplash.search.getPhotos({
                    query: options.query,
                    page: options.page || 1,
                    perPage: options.perPage || 10,
                    orientation: options.orientation,
                    collections: options.collections,
                    contentFilter: options.contentFilter,
                    color: options.color,
                });

            this.updateRateLimitInfo(response);

            if (response.errors) {
                console.error('Unsplash API errors:', response.errors);
                return null;
            }

            if (!response.response) {
                return null;
            }

            return {
                results: response.response.results.map(this.mapPhotoResponse),
                total: response.response.total,
                totalPages: response.response.total_pages,
            };
        } catch (error) {
            console.error('Error searching photos on Unsplash:', error);
            return null;
        }
    }

    async findPhotoById(
        photoId: string,
    ): Promise<UnsplashPhotoResponse | null> {
        try {
            if (this.isApproachingRateLimit()) {
                console.log(this.UNSPLASH_API_RATE_LIMIT_MESSAGE);
                return null;
            }

            const response: ApiResponse<Basic> = await this.unsplash.photos.get(
                { photoId },
            );

            this.updateRateLimitInfo(response);

            if (response.errors) {
                console.error('Unsplash API errors:', response.errors);
                return null;
            }

            if (!response.response) {
                return null;
            }

            return this.mapPhotoResponse(response.response);
        } catch (error) {
            console.error(
                `Error getting photo with ID ${photoId} from Unsplash:`,
                error,
            );
            return null;
        }
    }

    /**
     * This is for showing images to users before they download
     */
    getPreviewUrl(
        photo: UnsplashPhotoResponse,
        size: 'raw' | 'full' | 'regular' | 'small' | 'thumb' = 'regular',
        options?: UnsplashImageOptions,
    ): string {
        let url = photo.urls[size];

        if (options) {
            url = this.applyImageOptions(url, options);
        }

        return url;
    }


    private async processTrackResponse (downloadLocation: string): Promise<string> {
        const trackResponse = await this.unsplash.photos.trackDownload({
            downloadLocation: downloadLocation,
        });

        this.updateRateLimitInfo(trackResponse);

        if (trackResponse.errors) {
            console.error('Error tracking download:', trackResponse.errors);
            throw new Error('Failed to track download');
        }

        if (!trackResponse.response?.url) {
            throw new Error('No download URL received from track response');
        }

        return trackResponse.response.url;
    };

    /**
     * Download photo with proper tracking as required by Unsplash API
     * This can be called with either download_location or photo ID or full photo object
     */
    async downloadPhoto(
        downloadInfo: UnsplashPhotoDownloadInfo,
        options?: UnsplashImageOptions,
        asStream: boolean = false,
    ): Promise<Buffer | Readable> {
        try {
            if (this.isApproachingRateLimit()) {
                throw new Error(this.UNSPLASH_API_RATE_LIMIT_MESSAGE);
            }

            if (!downloadInfo.download_location && !downloadInfo.id) {
                throw new Error('Either photo ID or download location is required');
            }

            let downloadUrl: string | undefined;

            if (downloadInfo.download_location) {
                try {
                    console.log(`📥 Tracking download using download_location...`);
                    downloadUrl = await this.processTrackResponse(downloadInfo.download_location);
                } catch (error) {
                    console.log('Failed to download using download_location, trying with ID');
                    if (!downloadInfo.id) throw error;
                }
            }

            if (!downloadUrl && downloadInfo.id) {
                console.log(`📥 Fetching photo data for ID ${downloadInfo.id}...`);
                const photo = await this.findPhotoById(downloadInfo.id);

                if (!photo) {
                    throw new Error(`Photo with ID ${downloadInfo.id} not found`);
                }

                console.log(`📥 Tracking download for photo ${photo.id}...`);
                downloadUrl = await this.processTrackResponse(photo.links.download_location);
            }

            if (!downloadUrl) {
                throw new Error('Failed to obtain download URL');
            }

            if (options) {
                downloadUrl = this.applyImageOptions(downloadUrl, options);
                console.log(`🎨 Applied custom options: ${downloadUrl}`);
            }

            return downloadFileFromUrl(downloadUrl, asStream);
        } catch (error) {
            const id = 'id' in downloadInfo ? downloadInfo.id : 'unknown';
            console.error(`Error downloading photo ${id}:`, error);
            throw error;
        }
    }


    private applyImageOptions(
        url: string,
        options: UnsplashImageOptions,
    ): string {
        const params = new URLSearchParams();

        if (options.width) {
            params.append('w', options.width.toString());
        }

        if (options.height) {
            params.append('h', options.height.toString());
        }

        if (options.width || options.height) {
            params.append('fit', options.fit || 'crop');

            if (options.fit === 'crop' || !options.fit) {
                params.append('crop', options.cropMode || 'center');
            }
        }

        if (options.quality) {
            params.append('q', options.quality.toString());
        }

        if (options.format) {
            params.append('fm', options.format);
        }

        if (options.blur) {
            params.append('blur', options.blur.toString());
        }

        if (options.brightness) {
            params.append('bri', options.brightness.toString());
        }

        if (options.contrast) {
            params.append('con', options.contrast.toString());
        }

        if (options.saturation) {
            params.append('sat', options.saturation.toString());
        }

        const separator = url.includes('?') ? '&' : '?';
        const paramString = params.toString();

        return paramString ? `${url}${separator}${paramString}` : url;
    }

    getRateLimitInfo(): UnsplashRateLimitInfo | null {
        if (
            this.lastRateLimitInfo &&
            this.lastRateLimitInfo.lastUpdated.getHours() !==
                new Date().getHours()
        ) {
            this.lastRateLimitInfo = null;
        }

        return this.lastRateLimitInfo;
    }

    isApproachingRateLimit(): boolean {
        const rateLimitInfo = this.getRateLimitInfo();
        if (!rateLimitInfo) return false;

        const { limit, remaining } = rateLimitInfo;
        return remaining <= limit * 0.05;
    }

    private updateRateLimitInfo(response: ApiResponse<any>): void {
        try {
            if (response.originalResponse?.headers) {
                const headers = response.originalResponse.headers;
                const limit = String(headers.get('x-ratelimit-limit'));
                const remaining = String(headers.get('x-ratelimit-remaining'));

                if (limit && remaining) {
                    this.lastRateLimitInfo = {
                        limit: parseInt(limit),
                        remaining: parseInt(remaining),
                        lastUpdated: new Date(),
                    };

                    console.log(
                        `📈 Unsplash API Rate Limit: ${remaining}/${limit} requests remaining.`,
                    );
                }
            }
        } catch (error) {
            console.error('Error updating rate limit info:', error);
        }
    }

    private mapPhotoResponse = (photo: any): UnsplashPhotoResponse => {
        return {
            id: photo.id,
            urls: {
                raw: photo.urls.raw,
                full: photo.urls.full,
                regular: photo.urls.regular,
                small: photo.urls.small,
                thumb: photo.urls.thumb,
            },
            links: {
                self: photo.links.self,
                html: photo.links.html,
                download: photo.links.download,
                download_location: photo.links.download_location,
            },
            user: {
                name: photo.user.name,
                username: photo.user.username,
            },
            description: photo.description,
            alt_description: photo.alt_description,
        };
    };

    /**
     * Downloads a photo from Unsplash by its ID and prepares it as an Express.Multer.File object.
     * This method handles the required download tracking.
     * @param photoId The ID of the photo on Unsplash.
     * @returns A Promise resolving to an Express.Multer.File object.
     */
    async downloadAndPrepareFile(photoId: string): Promise<Express.Multer.File> {
        const photoInfo = await this.findPhotoById(photoId);
        if (!photoInfo) {
            throw new NotFoundException(`Photo with ID ${photoId} not found on Unsplash.`);
        }

        const imageBuffer = await this.downloadPhoto({
            download_location: photoInfo.links.download_location,
            id: photoId, // Передаємо ID як запасний варіант
        }) as Buffer;

        // 3. Визначаємо MIME-тип та розширення
        const mimeType = 'image/jpeg'; // Unsplash зазвичай повертає JPEG
        const extension = mime.extension(mimeType) || 'jpg';


        // 4. Створюємо об'єкт, сумісний з Express.Multer.File
        return {
            buffer: imageBuffer,
            mimetype: mimeType,
            originalname: `${photoId}.${extension}`,
            size: imageBuffer.length,
        } as Express.Multer.File;
    }
}
