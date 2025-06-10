// prisma/seeds/services/default-files.service.ts
import { FileTargetType } from '@prisma/client';
import { BaseSeederService } from '../core/base-seeder.service';
import { SEED_CONSTANTS } from '../../constants/seed.constants';
import { parseFilename } from '../../../../src/common/utils';
import * as mime from 'mime-types';
import {
    UPLOAD_ALLOWED_FILE_MIME_TYPES,
    UPLOAD_ALLOWED_MAX_FILE_SIZES,
} from '../../../../src/core/file-upload/constants/file-upload.contsants';
import { UnsplashPhotoResponse } from '../../../../src/core/unsplash/interfaces/unsplash.interfaces';
import { fromBuffer } from 'file-type';
import * as fs from 'fs/promises';
import * as path from 'path';

export class DefaultFilesService {
    private baseSeeder: BaseSeederService;

    constructor() {
        this.baseSeeder = BaseSeederService.getInstance();
    }

    async saveAllDefaultFiles(): Promise<void> {
        try {
            const defaultUserAvatarId = await this.saveDefaultFile(
                SEED_CONSTANTS.FILES.DEFAULT_USER_AVATAR_ASSET
                    .FILENAME as string,
                FileTargetType.USER_AVATAR,
            );

            console.log(
                `✅ Default user avatar created (ID: ${defaultUserAvatarId})`,
            );

            const defaultProjectPreviewId = await this.saveDefaultFile(
                SEED_CONSTANTS.FILES.DEFAULT_PROJECT_PREVIEW.FILENAME as string,
                FileTargetType.PROJECT_PREVIEW,
            );

            console.log(
                `✅ Default project preview created (ID: ${defaultProjectPreviewId})`,
            );

            const defaultProjectAssetId = await this.saveDefaultFile(
                SEED_CONSTANTS.FILES.DEFAULT_PROJECT_ASSET.FILENAME as string,
                FileTargetType.PROJECT_ASSET,
            );

            console.log(
                `✅ Default project asset created (ID: ${defaultProjectAssetId})`,
            );

            const defaultProjectElementIds =
                await this.saveDefaultProjectElements();

            console.log(
                `✅ ${defaultProjectElementIds.length} default project elements created`,
            );
        } catch (error) {
            console.error('❌ Error saving default files:', error);
        }
    }

    private async saveDefaultFile(
        filename: string,
        targetType: FileTargetType,
    ): Promise<number> {
        const { key, extension } = parseFilename(filename);

        const file = await this.baseSeeder.filesService.create({
            isDefault: true,
            targetType,
            fileKey: key,
            mimeType: mime.lookup(filename),
            extension: extension,
        });

        return file.id;
    }

    async saveDefaultProjectElements(): Promise<number[]> {
        const filePathsService = this.baseSeeder.filePathsService;
        const dir = filePathsService.getDirectoryPath(
            FileTargetType.PROJECT_ELEMENT,
            true,
        );

        const files = await fs.readdir(dir);
        const fileIds: number[] = [];

        for (let i = 0; i < files.length; i++) {
            const filename = files[i];
            const filePath = path.join(dir, filename);
            const stat = await fs.stat(filePath);
            if (!stat.isFile()) {
                continue;
            }

            const fileId = await this.saveDefaultFile(
                filename,
                FileTargetType.PROJECT_ELEMENT,
            );

            fileIds.push(fileId);
        }
        return fileIds;
    }

    async createDefaultProjectBackgrounds(): Promise<void> {
        const {
            CATEGORIES,
            COUNT_PER_QUERY,
            WIDTH,
            HEIGHT,
            ORIENTATION,
            CONTENT_FILTER,
            FORMAT,
        } = SEED_CONSTANTS.UNSPLASH.PROJECT_BACKGROUNDS;

        const MAX_PER_PAGE = SEED_CONSTANTS.UNSPLASH.MAX_PER_PAGE;

        const fileIds: number[] = [];

        const totalPhotos = CATEGORIES.reduce(
            (sum, category) => sum + category.queries.length * COUNT_PER_QUERY,
            0,
        );

        console.log(
            `📸 Creating ${totalPhotos} default project assets from Unsplash...`,
        );
        console.log(
            `📊 Strategy: ${COUNT_PER_QUERY} photo(s) per query using ${(COUNT_PER_QUERY as any) === 1 ? 'random' : 'search'} method`,
        );

        for (
            let categoryIndex = 0;
            categoryIndex < CATEGORIES.length;
            categoryIndex++
        ) {
            const category = CATEGORIES[categoryIndex];

            console.log(
                `\n📂 Processing category "${category.name}" (${category.queries.length} queries)`,
            );

            for (
                let queryIndex = 0;
                queryIndex < category.queries.length;
                queryIndex++
            ) {
                const query = category.queries[queryIndex];
                const queryWithName = `${category.name} ${query}`;

                try {
                    console.log(
                        `  🔍 Query ${queryIndex + 1}/${category.queries.length}: "${queryWithName}"`,
                    );

                    let photos: UnsplashPhotoResponse[] = [];

                    if ((COUNT_PER_QUERY as any) === 1) {
                        const randomPhotos =
                            await this.baseSeeder.unsplashService.findRandomPhotos(
                                {
                                    query: queryWithName,
                                    count: 1,
                                    orientation: ORIENTATION,
                                    contentFilter: CONTENT_FILTER,
                                },
                            );

                        if (randomPhotos && randomPhotos.length > 0) {
                            photos = randomPhotos;
                        }
                    } else {
                        const searchResult =
                            await this.baseSeeder.unsplashService.findPhotos({
                                query: queryWithName,
                                page: 1,
                                perPage: Math.min(
                                    COUNT_PER_QUERY + 2,
                                    MAX_PER_PAGE,
                                ),
                                orientation: ORIENTATION,
                                contentFilter: CONTENT_FILTER,
                            });

                        if (searchResult && searchResult.results.length > 0) {
                            photos = searchResult.results.slice(
                                0,
                                COUNT_PER_QUERY,
                            );
                        }
                    }

                    if (photos.length === 0) {
                        console.warn(
                            `    ⚠️ No photos found for query: "${queryWithName}"`,
                        );
                        continue;
                    }

                    console.log(
                        `    📷 Found ${photos.length} photo(s), processing...`,
                    );

                    for (
                        let photoIndex = 0;
                        photoIndex < photos.length;
                        photoIndex++
                    ) {
                        const photo = photos[photoIndex];

                        try {
                            console.log(
                                `    📥 Downloading photo ${photoIndex + 1}/${photos.length}: ${photo.id}`,
                            );

                            const imageBuffer =
                                (await this.baseSeeder.unsplashService.downloadPhoto(
                                    {
                                        download_location:
                                            photo.links.download_location,
                                    },
                                    {
                                        width: WIDTH,
                                        height: HEIGHT,
                                        fit: 'crop',
                                        cropMode: 'center',
                                        format: FORMAT,
                                    },
                                )) as Buffer;

                            if (
                                imageBuffer.length >
                                UPLOAD_ALLOWED_MAX_FILE_SIZES.PROJECT_BACKGROUND
                            ) {
                                console.warn(
                                    `    ⚠️ Photo ${photo.id} too large (${imageBuffer.length} bytes), skipping`,
                                );
                                continue;
                            }

                            const imageBufferResponse =
                                await fromBuffer(imageBuffer);
                            if (!imageBufferResponse) {
                                console.warn(
                                    `    ⚠️ Unable to determine mime type for photo ${photo.id}, skipping`,
                                );
                                continue;
                            }

                            const allowedMimeTypes: string[] = [
                                ...UPLOAD_ALLOWED_FILE_MIME_TYPES.PROJECT_BACKGROUND,
                            ];

                            if (
                                !allowedMimeTypes.includes(
                                    imageBufferResponse.mime,
                                )
                            ) {
                                console.warn(
                                    `    ⚠️ Invalid mime type for photo ${photo.id}: ${imageBufferResponse.mime}`,
                                );
                                continue;
                            }

                            const sanitizedQuery = query
                                .replace(/[^a-zA-Z0-9]/g, '-')
                                .toLowerCase();
                            const sanitizedCategoryName = category.name
                                .replace(/[^a-zA-Z0-9]/g, '-')
                                .toLowerCase();
                            const fileKey = `default-${sanitizedCategoryName}-${sanitizedQuery}-${photoIndex + 1}`;

                            const multerFile: Express.Multer.File = {
                                originalname: `${photo.id}.${FORMAT}`,
                                mimetype: imageBufferResponse.mime,
                                buffer: imageBuffer,
                            } as Express.Multer.File;

                            const result =
                                await this.baseSeeder.fileUploadService.upload(
                                    multerFile,
                                    {
                                        targetType:
                                            FileTargetType.PROJECT_BACKGROUND,
                                        isDefault: true,
                                        fileKey: fileKey,
                                    },
                                );

                            fileIds.push(result.fileId);
                            console.log(
                                `    ✅ Created asset: ${fileKey} (ID: ${result.fileId})`,
                            );
                        } catch (error) {
                            console.error(
                                `    ❌ Error processing photo ${photo.id}:`,
                                error,
                            );
                        }
                    }
                } catch (error) {
                    console.error(
                        `  ❌ Error processing query "${queryWithName}":`,
                        error,
                    );
                }
            }
        }

        console.log(
            `\n🎉 Successfully created ${fileIds.length}/${totalPhotos} project assets`,
        );
    }
}
