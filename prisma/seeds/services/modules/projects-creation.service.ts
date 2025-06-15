// prisma/seeds/services/modules/projects-creation.service.ts
import { faker } from '@faker-js/faker';
import { BaseSeederService } from '../core/base-seeder.service';
import { SEED_CONSTANTS } from '../../constants/seed.constants';
import { CreateProjectDto } from '../../../../src/modules/projects/dto/create-project.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ProjectTemplate {
    type: string;
    title: string;
    description: string;
    content: any;
}

export class ProjectsCreationService {
    private baseSeeder: BaseSeederService;
    private templateContents: ProjectTemplate[] = [];

    constructor() {
        this.baseSeeder = BaseSeederService.getInstance();
    }

    async createProjects(): Promise<void> {
        console.log('🎨 Starting projects creation...');

        await this.loadTemplateContents();
        const templateProjectIds = await this.createTemplateProjects();

        if (templateProjectIds.length > 0) {
            await this.createUserProjects(templateProjectIds);
        } else {
            console.warn('⚠️ No template projects created, skipping user project creation.');
        }


        console.log('🎨 Projects creation completed!');
    }

    private async loadTemplateContents(): Promise<void> {
        console.log('📋 Loading template contents from JSON files...');
        const templatesDir = path.join(process.cwd(), 'prisma', 'seeds', 'templates');

        try {
            const files = await fs.readdir(templatesDir);
            const jsonFiles = files.filter(file => file.startsWith('template-content-') && file.endsWith('.json'));

            for (const file of jsonFiles) {
                const filePath = path.join(templatesDir, file);
                const content = await fs.readFile(filePath, 'utf-8');
                this.templateContents.push(JSON.parse(content));
            }

            console.log(`📋 Loaded ${this.templateContents.length} template contents.`);
        } catch (error) {
            console.error('❌ Error loading template content files. Make sure the /prisma/seeds/templates directory and files exist.', error);
        }
    }

    private async createTemplateProjects(): Promise<number[]> {
        console.log(`🎨 Creating ${this.templateContents.length} template projects...`);
        const createdTemplateIds: number[] = [];

        for (const template of this.templateContents) {
            try {
                console.log(`📋 Creating template: ${template.title}`);

                const projectData: CreateProjectDto = {
                    title: template.title,
                    type: template.type,
                    description: template.description,
                    content: template.content,
                    isTemplate: true,
                };

                // Створюємо проект точно так, як він описаний в JSON
                const project = await this.baseSeeder.projectsService.create(projectData);
                createdTemplateIds.push(project.id);

                console.log(`✅ Template created: ${template.title} (ID: ${project.id})`);
            } catch (error) {
                console.error(`❌ Failed to create template "${template.title}":`, error);
            }
        }
        return createdTemplateIds;
    }

    private async createUserProjects(templateProjectIds: number[]): Promise<void> {
        console.log('👥 Creating user projects...');
        const users = await this.baseSeeder.dbService.user.findMany({
            select: { id: true, firstName: true, lastName: true },
        });

        const { MIN_COUNT_PER_USER, MAX_COUNT_PER_USER } = SEED_CONSTANTS.PROJECTS.USER_PROJECTS;
        const SPECIAL_PROJECTS_PER_USER = 2;

        for (const user of users) {
            const totalProjectCount = faker.number.int({
                min: MIN_COUNT_PER_USER,
                max: MAX_COUNT_PER_USER,
            });

            console.log(`👤 Creating ${totalProjectCount} projects for user ${user.firstName} ${user.lastName}`);

            // 1. Створюємо "особливі" проекти шляхом копіювання системних шаблонів
            for (let i = 0; i < SPECIAL_PROJECTS_PER_USER; i++) {
                try {
                    const randomTemplateId = faker.helpers.arrayElement(templateProjectIds);
                    console.log(`  ↪️ Copying template (ID: ${randomTemplateId}) for user ${user.id}`);
                    await this.baseSeeder.projectsService.copy(randomTemplateId, user.id);
                } catch (error) {
                    console.error(`  ❌ Failed to copy template for user ${user.id}:`, error);
                }
            }

            // 2. Створюємо решту проектів з простими фігурами
            const simpleProjectsCount = totalProjectCount - SPECIAL_PROJECTS_PER_USER;
            for (let i = 0; i < simpleProjectsCount; i++) {
                try {
                    const templateType = faker.helpers.arrayElement(SEED_CONSTANTS.PROJECTS.TEMPLATES.TYPES);
                    const projectData: CreateProjectDto = {
                        title: this.generateUserProjectTitle(),
                        type: templateType.type,
                        description: faker.lorem.sentence(),
                        // Генеруємо контент з фігурами і БЕЗ thumbnailUrl
                        content: this.generateShapeBasedContent(templateType),
                        isTemplate: false,
                    };

                    await this.baseSeeder.projectsService.create(projectData, user.id);
                } catch (error) {
                    console.error(`  ❌ Failed to create simple project for user ${user.id}:`, error);
                }
            }
            console.log(`  ✅ Created ${totalProjectCount} total projects for user ${user.id}`);
        }
    }

    private generateUserProjectTitle(): string {
        const { TITLE_PREFIXES, TITLE_SUFFIXES } = SEED_CONSTANTS.PROJECTS.USER_PROJECTS;
        const prefix = faker.helpers.arrayElement(TITLE_PREFIXES);
        const suffix = faker.helpers.arrayElement(TITLE_SUFFIXES);
        return `${prefix} ${suffix} #${faker.number.int({ min: 1, max: 999 })}`;
    }

    private generateShapeBasedContent(template: any): any {
        const renderableObjects: any[] = [];
        const shapeCount = faker.number.int({ min: 3, max: 7 });

        for (let i = 0; i < shapeCount; i++) {
            const isRect = faker.datatype.boolean();
            const width = faker.number.int({ min: 50, max: 400 });
            const height = isRect ? faker.number.int({ min: 50, max: 400 }) : width; // circle

            renderableObjects.push({
                id: faker.string.uuid(),
                type: isRect ? 'rect' : 'circle',
                x: faker.number.int({ min: 0, max: template.width }),
                y: faker.number.int({ min: 0, max: template.height }),
                width,
                height,
                fill: faker.color.rgb(),
                rotation: faker.number.int({ min: 0, max: 90 }),
                opacity: faker.number.float({ min: 0.5, max: 1, fractionDigits: 2 }),
            });
        }

        return {
            width: template.width,
            height: template.height,
            backgroundColor: faker.color.rgb(),
            isTransparent: false,
            showGrid: false,
            gridColor: 'black',
            renderableObjects,
            // Важливо: ми НЕ передаємо thumbnailUrl, щоб сервіс використав дефолтне прев'ю
        };
    }
}
