// prisma/seeds/files.seed.ts
import { DefaultFilesService } from './services/modules/default-files.service';

export class FilesSeed {
    private defaultFilesService: DefaultFilesService;

    constructor() {
        this.defaultFilesService = new DefaultFilesService();
    }

    async run(): Promise<void> {
        console.log('📂 Seeding files...');

        await this.defaultFilesService.saveAllDefaultFiles();
        await this.defaultFilesService.createDefaultProjectBackgrounds();

        console.log('\n✅ Files seeding completed!\n');
    }
}
