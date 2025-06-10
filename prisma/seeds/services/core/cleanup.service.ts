// prisma/seeds/services/cleanup.service.ts
import { cleanupDirectory, cleanupDirectoryExcept, directoryExists } from '../../../../src/common/utils';
import { BaseSeederService } from './base-seeder.service';
import { FileTargetType } from '@prisma/client';
import { STORAGE_UPLOAD_CATEGORIES } from '../../../../src/config/configs/storage.config';
import { SEED_CONSTANTS } from '../../constants/seed.constants';

export class CleanupService {
    private baseSeeder: BaseSeederService;

    constructor() {
        this.baseSeeder = BaseSeederService.getInstance();
    }

    async cleanupAllFiles(): Promise<void> {
        console.log('🧹 Starting cleanup of old files...');

        await Promise.all([
            this.cleanupDefaultProjectAssets(),
            this.cleanupDefaultProjectBackgrounds(),
            this.cleanupStorageUploads(),
        ]);

        console.log('✅ Cleanup completed!');
    }

    private async cleanupDefaultProjectAssets(): Promise<void> {
        try {
            const defaultAssetsDir = this.baseSeeder.filePathsService.getDirectoryPath(
                FileTargetType.PROJECT_ASSET,
                true
            );

            console.log(`🧹 Cleaning default project assets in: ${defaultAssetsDir}`);
            await cleanupDirectoryExcept(defaultAssetsDir, [SEED_CONSTANTS.FILES.DEFAULT_PROJECT_ASSET.FILENAME]);
        } catch (error) {
            console.error('❌ Error cleaning project assets:', error);
        }
    }

    private async cleanupDefaultProjectBackgrounds(): Promise<void> {
        try {
            const defaultBackgroundsDir = this.baseSeeder.filePathsService.getDirectoryPath(
                FileTargetType.PROJECT_BACKGROUND,
                true
            );

            console.log(`🧹 Cleaning default project backgrounds in: ${defaultBackgroundsDir}`);
            await cleanupDirectory(defaultBackgroundsDir);
        } catch (error) {
            console.error('❌ Error cleaning project backgrounds:', error);
        }
    }

    private async cleanupStorageUploads(): Promise<void> {
        try {
            const storageConfig = this.baseSeeder.configService.get('storage');
            const uploadPaths = storageConfig.paths.uploads;

            console.log('🧹 Cleaning up all storage uploads...');

            for (const categoryKey in STORAGE_UPLOAD_CATEGORIES) {
                const targetPath = uploadPaths[categoryKey];
                const categoryName = STORAGE_UPLOAD_CATEGORIES[categoryKey as keyof typeof STORAGE_UPLOAD_CATEGORIES];

                console.log(`🧹 Cleaning ${categoryName} in: ${targetPath}`);
                await cleanupDirectory(targetPath);
            }
        } catch (error) {
            console.error('❌ Error cleaning storage uploads:', error);
        }
    }
}
