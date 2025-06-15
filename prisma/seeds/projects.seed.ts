// prisma/seeds/projects.seed.ts
import { ProjectsCreationService } from './services/modules/projects-creation.service';

export class ProjectsSeed {
    private projectsCreationService: ProjectsCreationService;

    constructor() {
        this.projectsCreationService = new ProjectsCreationService();
    }

    async run(): Promise<void> {
        console.log('🎨 Starting projects seeding...\n');

        await this.projectsCreationService.createProjects();

        console.log('\n🎨 Projects seeding completed!\n');
    }
}
