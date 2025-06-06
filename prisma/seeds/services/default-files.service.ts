// prisma/seeds/services/default-files.service.ts
import * as fs from 'fs/promises';
import { FileTargetType } from '@prisma/client';
import { BaseSeederService } from './base-seeder.service';
import { SEED_CONSTANTS } from '../constants/seed.constants';
import { buildFilePath, ensureDirectoryExists } from '../../../src/common/utils';

export class DefaultFilesService {
    private baseSeeder: BaseSeederService;

    constructor() {
        this.baseSeeder = BaseSeederService.getInstance();
    }

    async createDefaultAvatar(): Promise<number> {
        const { FILENAME } = SEED_CONSTANTS.FILES.DEFAULT_USER_AVATAR_ASSET;
        const key = FILENAME.split('.')[0];
        const extension = FILENAME.split('.')[1];

        const avatarDir = this.baseSeeder.filePathsService.getDirectoryPath(
            FileTargetType.USER_AVATAR,
            true
        );

        await ensureDirectoryExists(avatarDir);

        const defaultAvatarPath = buildFilePath(avatarDir, FILENAME);

        try {
            await fs.access(defaultAvatarPath);
            console.log(`Default avatar already exists: ${defaultAvatarPath}`);
        } catch {
            console.log(`Creating default avatar placeholder at: ${defaultAvatarPath}`);
            await fs.writeFile(defaultAvatarPath, Buffer.alloc(0));
        }

        const file = await this.baseSeeder.filesService.create({
            isDefault: true,
            targetType: FileTargetType.USER_AVATAR,
            fileKey: key,
            mimeType: 'image/png',
            extension: extension,
        });

        return file.id;
    }

    async createDefaultProjectPreview(): Promise<number> {
        const { FILENAME } = SEED_CONSTANTS.FILES.DEFAULT_PROJECT_PREVIEW;
        const key = FILENAME.split('.')[0];
        const extension = FILENAME.split('.')[1];

        const projectPreviewDir = this.baseSeeder.filePathsService.getDirectoryPath(
            FileTargetType.PROJECT_PREVIEW,
            true
        );

        await ensureDirectoryExists(projectPreviewDir);

        const defaultProjectPreviewPath = buildFilePath(projectPreviewDir, FILENAME);

        try {
            await fs.access(defaultProjectPreviewPath);
            console.log(`Default avatar already exists: ${defaultProjectPreviewPath}`);
        } catch {
            console.log(`Creating default avatar placeholder at: ${defaultProjectPreviewPath}`);
            await fs.writeFile(defaultProjectPreviewPath, Buffer.alloc(0));
        }

        const file = await this.baseSeeder.filesService.create({
            isDefault: true,
            targetType: FileTargetType.PROJECT_PREVIEW,
            fileKey: key,
            mimeType: 'image/jpeg',
            extension: extension,
        });

        return file.id;
    }

    async createDefaultProjectAsset(): Promise<number> {
        const { FILENAME } = SEED_CONSTANTS.FILES.DEFAULT_PROJECT_ASSET;
        const key = FILENAME.split('.')[0];
        const extension = FILENAME.split('.')[1];

        const projectAssetDir = this.baseSeeder.filePathsService.getDirectoryPath(
            FileTargetType.PROJECT_ASSET,
            true
        );

        await ensureDirectoryExists(projectAssetDir);

        const defaultProjectAssetPath = buildFilePath(projectAssetDir, FILENAME);

        try {
            await fs.access(defaultProjectAssetPath);
            console.log(`Default avatar already exists: ${defaultProjectAssetPath}`);
        } catch {
            console.log(`Creating default avatar placeholder at: ${defaultProjectAssetPath}`);
            await fs.writeFile(defaultProjectAssetPath, Buffer.alloc(0));
        }

        const file = await this.baseSeeder.filesService.create({
            isDefault: true,
            targetType: FileTargetType.PROJECT_ASSET,
            fileKey: key,
            mimeType: 'image/jpeg',
            extension: extension,
        });

        return file.id;
    }

    async createDefaultProjectAssets(): Promise<number[]> {
        const { COUNT, CATEGORIES } = SEED_CONSTANTS.FILES.DEFAULT_PROJECT_ASSETS_UNSPLASH;
        const fileIds: number[] = [];

        const projectAssetsDir = this.baseSeeder.filePathsService.getDirectoryPath(
            FileTargetType.PROJECT_ASSET,
            true
        );

        await ensureDirectoryExists(projectAssetsDir);

        console.log(`📸 Creating ${COUNT} default project assets...`);

        for (let i = 0; i < COUNT; i++) {
            try {
                const category = CATEGORIES[i % CATEGORIES.length];

                console.log(`📷 Downloading project asset ${i + 1}/${COUNT} from category: ${category.name}`);

                const photoData = await this.baseSeeder.unsplashService.downloadProjectAsset(
                    category,
                    i,
                    projectAssetsDir
                );

                if (photoData) {
                    const file = await this.baseSeeder.filesService.create({
                        isDefault: true,
                        targetType: FileTargetType.PROJECT_ASSET,
                        fileKey: photoData.fileKey,
                        mimeType: photoData.mimeType,
                        extension: photoData.extension,
                    });

                    fileIds.push(file.id);
                    console.log(`✅ Created default project asset: ${photoData.fileKey} (ID: ${file.id})`);
                } else {
                    console.warn(`❌ Failed to download project asset ${i + 1}`);
                }
            } catch (error) {
                console.error(`❌ Error creating project asset ${i + 1}:`, error);
            }
        }

        return fileIds;
    }
}
