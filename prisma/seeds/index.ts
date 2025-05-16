// prisma/seeds/index.ts
import { DatabaseService } from '../../src/core/db/database.service';
import { UsersService } from '../../src/core/users/users.service';
import { UsersRepository } from '../../src/core/users/users.repository';
import { createInitialUsers } from './users';
import { HashingPasswordsService } from '../../src/core/users/hashing-passwords.service';
import { HashingService } from '../../src/core/hashing/hashing.service';

class Seeder {
    constructor(
        // private readonly databaseService: DatabaseService,
        private readonly usersService: UsersService,
    ) {
    }

    async start() {
        await this.seedUsers();
        console.log('Users were created 👥');
        console.log('Seeding completed 🍹');
    }

    async seedUsers() {
        const users = await createInitialUsers();

        for (const user of users) {
            const { profilePictureName, gender, ...userData } = user;
            const createdUser = await this.usersService.create(userData);

            // await this.usersService.updateUserAvatar(
            //     createdUser.id,
            //     profilePictureName
            // );
        }
    }
}

async function start() {
    try {
        console.log('Seeding started 🌱');
        const dbService = new DatabaseService();
        const hashingService = new HashingService();
        const passwordService = new HashingPasswordsService(hashingService);

        const userService = new UsersService(
            new UsersRepository(dbService),
            passwordService,);

        const seeder = new Seeder(
            // dbService,
            userService,
        );
        await seeder.start();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

start();
