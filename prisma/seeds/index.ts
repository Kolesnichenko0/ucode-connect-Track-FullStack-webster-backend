// prisma/seeds/index.ts
import { FilesSeed } from './files.seed';
import { UsersSeed } from './users.seed';
import { CleanupService } from './services/cleanup.service';

async function runSeeds() {
    try {
        console.log('🌱 Starting seeding process...\n');
        console.log('=' .repeat(60));

        // 0. Очищаем старые файлы
        const cleanupService = new CleanupService();
        await cleanupService.cleanupAllFiles();

        console.log('=' .repeat(60));

        // 1. Создаем дефолтные файлы
        const filesSeed = new FilesSeed();
        const filesResult = await filesSeed.run();

        console.log('📊 Files Summary:');
        console.log(`   • Default avatar ID: ${filesResult.defaultAvatarId}`);
        console.log(`   • Project assets created: ${filesResult.projectAssetIds.length}`);
        console.log('=' .repeat(60));

        // 2. Создаем пользователей
        const usersSeed = new UsersSeed();
        await usersSeed.run();

        console.log('=' .repeat(60));
        console.log('🎉 All seeding completed successfully!');
        console.log('=' .repeat(60));
    } catch (error) {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
    }
}

runSeeds();
