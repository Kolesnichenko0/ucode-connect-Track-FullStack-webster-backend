// prisma/seeds/services/users-creation.service.ts
import { faker } from '@faker-js/faker';
import { FileTargetType } from '@prisma/client';
import { BaseSeederService } from './base-seeder.service';
import { SEED_CONSTANTS } from '../constants/seed.constants';
import { generateFileKey, ensureDirectoryExists } from '../../../src/common/utils';
import * as fs from 'fs';

interface CreateUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isMale: boolean;
}

export class UsersCreationService {
    private baseSeeder: BaseSeederService;

    constructor() {
        this.baseSeeder = BaseSeederService.getInstance();
    }

    async createUsers(): Promise<void> {
        console.log('👥 Starting users creation...');

        const users = this.generateUsersData();

        // Подготавливаем директорию для аватарок
        const avatarsDir = this.baseSeeder.filePathsService.getDirectoryPath(
            FileTargetType.USER_AVATAR,
            false // isDefault = false (пользовательские аватарки)
        );
        await ensureDirectoryExists(avatarsDir);

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const userNumber = i + 1;

            try {
                console.log(`👤 Creating user ${userNumber}/${users.length}: ${user.email}`);

                // Создаем пользователя (автоматически получит дефолтную аватарку)
                const createdUser = await this.baseSeeder.usersService.create({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password,
                });

                // Для всех пользователей кроме первого загружаем персональную аватарку
                if (userNumber > 1) {
                    await this.createUserAvatar(createdUser.id, user.isMale, avatarsDir);
                }

                if (userNumber === 1 || userNumber % 2 === 0) {
                    await this.baseSeeder.usersRepository.update(userNumber, {
                        isEmailVerified: true
                    });
                }

                console.log(`✅ User ${userNumber} created successfully: ${user.email}`);
            } catch (error) {
                console.error(`❌ Failed to create user ${userNumber}: ${user.email}`, error);
            }
        }

        console.log('👥 Users creation completed!');
    }

    private generateUsersData(): CreateUserData[] {
        const { TOTAL, PASSWORD, GENDER_PROBABILITY, TEST_USER } = SEED_CONSTANTS.USERS;
        const { DOMAIN } = SEED_CONSTANTS.PRODUCT;

        const users: CreateUserData[] = [];

        // Первый пользователь - тестовый (будет использовать дефолтную аватарку)
        users.push({
            firstName: TEST_USER.FIRST_NAME,
            lastName: TEST_USER.LAST_NAME,
            email: `${TEST_USER.EMAIL_PREFIX}@${DOMAIN}`,
            password: PASSWORD,
            isMale: false, // для тестового пользователя не важно
        });

        // Остальные пользователи
        for (let i = 1; i < TOTAL; i++) {
            const isMale = faker.datatype.boolean({ probability: GENDER_PROBABILITY });
            const firstName = faker.person.firstName(isMale ? 'male' : 'female');
            const lastName = faker.person.lastName(isMale ? 'male' : 'female');

            users.push({
                firstName,
                lastName,
                email: faker.internet.email({
                    firstName,
                    lastName,
                    provider: DOMAIN,
                    allowSpecialCharacters: false,
                }).toLowerCase(),
                password: PASSWORD,
                isMale,
            });
        }

        return users;
    }

    private async createUserAvatar(
        userId: number,
        isMale: boolean,
        avatarsDir: string
    ): Promise<void> {
        try {
            console.log(`📷 Downloading avatar for user ${userId}...`);

            // Загружаем аватарку через Unsplash
            const avatarFileName = await this.baseSeeder.unsplashService.downloadUserAvatar(
                userId,
                isMale,
                avatarsDir
            );

            if (!avatarFileName) {
                console.warn(`⚠️  Failed to download avatar for user ${userId}, keeping default`);
                return;
            }

            const avatarPath = `${avatarsDir}/${avatarFileName}`;

            if (!fs.existsSync(avatarPath)) {
                console.warn(`⚠️  Avatar file not found: ${avatarPath}`);
                return;
            }

            // Создаем новое имя файла с fileKey
            const fileKey = generateFileKey();
            const extension = 'jpg';
            const newFileName = `${fileKey}.${extension}`;
            const newPath = `${avatarsDir}/${newFileName}`;

            // Переименовываем файл
            fs.renameSync(avatarPath, newPath);

            // Создаем запись файла в БД
            const file = await this.baseSeeder.filesService.create({
                authorId: userId,
                isDefault: false,
                targetType: FileTargetType.USER_AVATAR,
                targetId: userId,
                fileKey: fileKey,
                mimeType: 'image/jpeg',
                extension: extension,
            });

            // Обновляем пользователя
            await this.baseSeeder.usersRepository.update(userId, {
                avatarFileId: file.id
            });

            console.log(`✅ Avatar uploaded for user ${userId}: ${fileKey}`);

        } catch (error) {
            console.error(`❌ Failed to create avatar for user ${userId}:`, error);
        }
    }
}
