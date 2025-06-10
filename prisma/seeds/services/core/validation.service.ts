// prisma/seeds/services/validation.service.ts
import { FileTargetType } from '@prisma/client';
import { buildFilePath } from '../../../../src/common/utils';
import * as fs from 'fs/promises';
import { BaseSeederService } from './base-seeder.service';
import { SEED_CONSTANTS } from '../../constants/seed.constants';

export class ValidationService {
    private baseSeeder: BaseSeederService;

    constructor() {
        this.baseSeeder = BaseSeederService.getInstance();
    }

    async checkRequiredFiles(): Promise<void> {
        console.log('🔍 Checking required files...');

        await this.checkRequiredIndividualFiles();
        await this.checkProjectElementsDirectory();

        console.log('✅ All required files found.\n');
    }

    private async checkRequiredIndividualFiles(): Promise<void> {
        const filePathsService = this.baseSeeder.filePathsService;
        const missingFiles: string[] = [];

        const filesToCheck = [
            {
                filename: SEED_CONSTANTS.FILES.DEFAULT_USER_AVATAR_ASSET.FILENAME,
                targetType: FileTargetType.USER_AVATAR,
            },
            {
                filename: SEED_CONSTANTS.FILES.DEFAULT_PROJECT_ASSET.FILENAME,
                targetType: FileTargetType.PROJECT_ASSET,
            },
            {
                filename: SEED_CONSTANTS.FILES.DEFAULT_PROJECT_PREVIEW.FILENAME,
                targetType: FileTargetType.PROJECT_PREVIEW,
            },
        ];

        for (const fileInfo of filesToCheck) {
            const dir = filePathsService.getDirectoryPath(fileInfo.targetType, true);
            const fullPath = buildFilePath(dir, fileInfo.filename);
            try {
                await fs.access(fullPath);
            } catch {
                missingFiles.push(fullPath);
            }
        }

        if (missingFiles.length > 0) {
            console.error('\n' + '='.repeat(60));
            console.error('❌ ERROR: Missing required default files!');
            console.error(
                'Please create the following files before running the seed:',
            );
            missingFiles.forEach((path) => console.error(`  - ${path}`));
            console.error('='.repeat(60) + '\n');
            process.exit(1);
        }
    }

    private async checkProjectElementsDirectory(): Promise<void> {
        const filePathsService = this.baseSeeder.filePathsService;
        const dir = filePathsService.getDirectoryPath(FileTargetType.PROJECT_ELEMENT, true);

        try {
            const files = await fs.readdir(dir);
            const elementsCount = files.length;

            if (elementsCount < SEED_CONSTANTS.FILES.DEFAULT_PROJECT_ELEMENT_MIN_COUNT) {
                console.error('\n' + '='.repeat(60));
                console.error('❌ ERROR: Not enough project elements!');
                console.error(
                    `Found ${elementsCount} elements in ${dir}, but minimum required is ${SEED_CONSTANTS.FILES.DEFAULT_PROJECT_ELEMENT_MIN_COUNT}.`,
                );
                console.error('='.repeat(60) + '\n');
                process.exit(1);
            }

            console.log(`✅ Found ${elementsCount} project elements (minimum required: ${SEED_CONSTANTS.FILES.DEFAULT_PROJECT_ELEMENT_MIN_COUNT}).\n`);
        } catch (error) {
            console.error('\n' + '='.repeat(60));
            console.error(`❌ ERROR: Could not access project elements directory: ${dir}`);
            console.error('Please make sure the directory exists and is accessible.');
            console.error('='.repeat(60) + '\n');
            process.exit(1);
        }
    }
}
