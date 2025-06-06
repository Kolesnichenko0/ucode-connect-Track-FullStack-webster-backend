// prisma/seeds/files.seed.ts
import { DefaultFilesService } from './services/default-files.service';

export class FilesSeed {
    private defaultFilesService: DefaultFilesService;

    constructor() {
        this.defaultFilesService = new DefaultFilesService();
    }

    async run(): Promise<{ defaultAvatarId: number; projectAssetIds: number[] }> {
        console.log('🗂️  Starting files seeding...\n');

        // Создаем дефолтную аватарку
        console.log('👤 Creating default avatar...');
        const defaultAvatarId = await this.defaultFilesService.createDefaultAvatar();
        console.log(`✅ Default avatar created with ID: ${defaultAvatarId}\n`);

        // Создаем дефолтный превью для проектов
        console.log('🖼️  Creating default project preview...');
        const defaultPreviewId = await this.defaultFilesService.createDefaultProjectPreview();
        console.log(`✅ Default project preview created with ID: ${defaultPreviewId}\n`);

        // Создаем дефолтные project assets
        console.log('🗂️  Creating default project asset...');
        const defaultProjectAssetId = await this.defaultFilesService.createDefaultProjectAsset();
        console.log(`✅ Default project asset created with ID: ${defaultProjectAssetId}\n`);

        // Создаем дефолтные project assets
        console.log('🖼️  Creating default project assets...');
        const projectAssetIds = await this.defaultFilesService.createDefaultProjectAssets();
        console.log(`✅ Created ${projectAssetIds.length} default project assets\n`);

        console.log('🗂️  Files seeding completed!\n');

        return { defaultAvatarId, projectAssetIds };
    }
}
