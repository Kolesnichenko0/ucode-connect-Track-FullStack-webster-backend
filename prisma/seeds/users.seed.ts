// prisma/seeds/users.seed.ts
import { UsersCreationService } from './services/users-creation.service';

export class UsersSeed {
    private usersCreationService: UsersCreationService;

    constructor() {
        this.usersCreationService = new UsersCreationService();
    }

    async run(): Promise<void> {
        console.log('👥 Starting users seeding...\n');

        await this.usersCreationService.createUsers();

        console.log('\n👥 Users seeding completed!\n');
    }
}
