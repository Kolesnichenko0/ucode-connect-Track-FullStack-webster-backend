// prisma/seeds/index.ts
import { FilesSeed } from './files.seed';
import { UsersSeed } from './users.seed';
import { ProjectsSeed } from './projects.seed';
import { CleanupService } from './services/core/cleanup.service';
import { ValidationService } from './services/core/validation.service';

async function runSeeds() {
    try {
        console.log('🌱 Starting seeding process...\n');
        console.log('='.repeat(60));

        const validationService = new ValidationService();
        await validationService.checkRequiredFiles();

        console.log('='.repeat(60));

        const cleanupService = new CleanupService();
        await cleanupService.cleanupAllFiles();

        console.log('='.repeat(60));

        const filesSeed = new FilesSeed();
        await filesSeed.run();

        console.log('='.repeat(60));

        const usersSeed = new UsersSeed();
        await usersSeed.run();

        const projectsSeed = new ProjectsSeed();
        await projectsSeed.run();

        console.log('='.repeat(60));
        console.log('🎉 All seeding completed successfully!');
        console.log('='.repeat(60));
    } catch (error) {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
    }
}

runSeeds();
