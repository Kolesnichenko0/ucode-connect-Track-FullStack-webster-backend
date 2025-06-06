// prisma/seeds/services/unsplash.service.ts
import { createApi } from 'unsplash-js';
import { ApiResponse } from 'unsplash-js/dist/helpers/response';
import { Random } from 'unsplash-js/dist/methods/photos/types';
import * as fs from 'fs/promises';
import axios from 'axios';
import { SEED_CONSTANTS, ProjectAssetCategory } from '../constants/seed.constants';
import { buildFilePath } from '../../../src/common/utils';
import { ApiConfigService } from '../../../src/config/api-config.service';

export class UnsplashService {
    private unsplash;

    constructor(cs: ApiConfigService) {
        this.unsplash = createApi({
            accessKey: cs.get('unsplash.accessKey'),
        });
    }

    async downloadProjectAsset(
        category: ProjectAssetCategory,
        index: number,
        savePath: string
    ): Promise<{ fileKey: string; mimeType: string; extension: string } | null> {
        try {
            const { WIDTH, HEIGHT, ORIENTATION } = SEED_CONSTANTS.FILES.DEFAULT_PROJECT_ASSETS_UNSPLASH;
            const keyword = category.keywords[index % category.keywords.length];
            const query = `${category.name} ${keyword}`;

            console.log(`🔍 Searching Unsplash for: "${query}"`);

            const response: ApiResponse<Random> = await this.unsplash.photos.getRandom({
                query,
                orientation: ORIENTATION,
                count: 1,
            });

            if (response.errors) {
                console.error('Unsplash API errors:', response.errors);
                return null;
            }

            const photo = Array.isArray(response.response)
                ? response.response[0]
                : response.response;

            if (!photo) {
                console.error('No photo received from Unsplash');
                return null;
            }

            // Строим URL с нужными размерами
            const photoUrl = `${photo.urls.raw}&w=${WIDTH}&h=${HEIGHT}&fit=crop&crop=center`;

            // Загружаем изображение
            const imageResponse = await axios.get(photoUrl, {
                responseType: 'arraybuffer',
                timeout: 15000,
            });

            const buffer = Buffer.from(imageResponse.data);

            // Создаем осмысленное имя файла
            const sanitizedKeyword = keyword.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            const fileKey = `default-${category.name}-${sanitizedKeyword}-${index + 1}`;
            const extension = 'jpg';
            const filename = `${fileKey}.${extension}`;

            const filePath = buildFilePath(savePath, filename);
            await fs.writeFile(filePath, buffer);

            console.log(`✅ Downloaded: ${filename} (by ${photo.user.name})`);

            return {
                fileKey,
                mimeType: 'image/jpeg',
                extension,
            };
        } catch (error) {
            console.error(`❌ Error downloading project asset for "${category.name}":`, error);
            return null;
        }
    }

    async downloadUserAvatar(
        userId: number,
        isMale: boolean,
        savePath: string
    ): Promise<string | null> {
        try {
            const { SIZE, ORIENTATION } = SEED_CONSTANTS.FILES.USER_AVATARS_UPLOADS_UNSPLASH;

            console.log(`🔍 Getting avatar from Unsplash for user ${userId}`);

            const query = isMale ? 'man user avatar icon' : 'woman user avatar icon';

            const response: ApiResponse<Random> = await this.unsplash.photos.getRandom({
                query,
                orientation: ORIENTATION,
                count: 1,
            });

            if (response.errors) {
                console.error('Unsplash API errors:', response.errors);
                this.handleUnsplashError(response.errors);
                return null;
            }

            const photo = Array.isArray(response.response)
                ? response.response[0]
                : response.response;

            if (!photo) {
                console.error('No photo received from Unsplash');
                return null;
            }

            // Строим URL с нужными размерами
            const photoUrl = `${photo.urls.raw}&w=${SIZE}&h=${SIZE}&fit=crop&crop=face`;

            // Загружаем изображение
            const imageResponse = await axios.get(photoUrl, {
                responseType: 'arraybuffer',
                timeout: 15000,
            });

            const buffer = Buffer.from(imageResponse.data);
            const fileName = `user-avatar-${userId}.jpg`;
            const filePath = buildFilePath(savePath, fileName);

            await fs.writeFile(filePath, buffer);

            console.log(`✅ Downloaded avatar for user ${userId} (by ${photo.user.name})`);
            return fileName;
        } catch (error) {
            console.error(`❌ Failed to download avatar for user ${userId}:`, error);
            this.handleUnsplashError(error);
            return null;
        }
    }

    private handleUnsplashError(error: any): void {
        const errorMessage = error?.message || error?.toString() || '';

        if (errorMessage.includes('expected JSON response from server') ||
            errorMessage.includes('DecodingError') ||
            Array.isArray(error) && error.some(err => err.includes('Rate Limit Exceeded'))) {
            console.log('');
            console.log('⚠️  Unsplash API rate limit reached (50 requests per hour)');
            console.log('   Please try running the seed again later or use a different Unsplash API key');
            console.log('');
        }
    }
}
