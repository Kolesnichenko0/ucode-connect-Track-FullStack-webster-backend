// prisma/seeds/index.ts
import { DatabaseService } from '../../src/core/db/database.service';
import { UsersService } from '../../src/core/users/users.service';
import { UsersRepository } from '../../src/core/users/users.repository';
import { createInitialUsers } from './users';
import { HashingPasswordsService } from '../../src/core/users/hashing-passwords.service';
import { HashingService } from '../../src/core/hashing/hashing.service';
import { FilesService } from '../../src/core/files/files.service';
import { FileRepository } from '../../src/core/files/files.repository';
import { FileTargetType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { FileUploadService } from 'src/core/file-upload/file-upload.service';
import { FilePathsService } from 'src/core/files/file-paths.service';
import { ConfigService } from '@nestjs/config';
import { ApiConfigService } from 'src/config/api-config.service';
import storageConfig from '../../src/config/configs/storage.config';
import appConfig from '../../src/config/configs/app.config';
import assetsConfig from '../../src/config/configs/assets.config';
import { setFilePathsService, setFilesService } from '../../src/core/users/entities/user.entity';

class Seeder {
    constructor(
        private readonly dbService: DatabaseService,
        private readonly usersService: UsersService,
        private readonly filesService: FilesService,
        private readonly filePathsService: FilePathsService,
        private readonly configService: ConfigService,
        private readonly apiConfigService: ApiConfigService
    ) {}

    async start() {
        const defaultAvatarId = await this.seedDefaultAvatar();
        console.log(`Default avatar created with ID: ${defaultAvatarId} 🖼️`);

        await this.seedUsers();
        console.log('Users were created 👥');

        console.log('Seeding completed 🍹');
    }

    async seedDefaultAvatar(): Promise<number> {
        // Проверяем, существует ли дефолтный файл в БД с id=1
        try {
            const existingFile = await this.filesService.findById(1);
            if (existingFile) {
                console.log('Default avatar already exists ✅');
                return existingFile.id;
            }
        } catch (error) {
            // Файл не найден, создаем новый
        }

        // Путь к дефолтному файлу аватарки в публичной папке
        const defaultAvatarPath = path.join(process.cwd(), 'public', 'assets', 'defaults', 'avatars', 'default-avatar.png');

        // Убедимся, что папка для дефолтных аватарок существует
        const defaultAvatarDir = path.join(process.cwd(), 'public', 'assets', 'defaults', 'avatars');
        if (!fs.existsSync(defaultAvatarDir)) {
            fs.mkdirSync(defaultAvatarDir, { recursive: true });
            // Здесь можно скопировать дефолтную аватарку из ресурсов проекта, если она еще не существует
        }

        // Генерируем ключ файла для БД
        const fileKey = 'default-avatar'; // Используем предсказуемый ключ для дефолтного файла
        const fileExt = 'png';
        const mimeType = 'image/png';

        // Создаем запись в БД - без копирования файла, так как он уже находится в public/assets
        const file = await this.filesService.create({
            authorId: undefined,
            isDefault: true,
            targetType: FileTargetType.USER_AVATAR,
            fileKey: fileKey,
            mimeType: mimeType,
            extension: fileExt,
        });

        return file.id;
    }

    async seedUsers() {
        const users = await createInitialUsers();

        for (const user of users) {
            const { profilePictureName, gender, ...userData } = user;
            // Устанавливаем profileFileId на 1 (ID дефолтной аватарки)
            const createdUser = await this.usersService.create({
                ...userData
            });
        }
    }
}

async function start() {
    try {
        console.log('Seeding started 🌱');
        const dbService = new DatabaseService();
        const hashingService = new HashingService();
        const passwordService = new HashingPasswordsService(hashingService);
        const configService = new ConfigService(
            {
                ...storageConfig(),
                ...appConfig(),
                ...assetsConfig()
            }
        );
        const apiConfigService = new ApiConfigService(configService);

        const fileRepository = new FileRepository(dbService);
        const filePathsService = new FilePathsService(apiConfigService);
        const filesService = new FilesService(fileRepository, filePathsService);

        const userService = new UsersService(
            new UsersRepository(dbService),
            passwordService,
            new FileUploadService(filesService, filePathsService),
            filesService,
            filePathsService
        );

        setFilesService(filesService);
        setFilePathsService(filePathsService);

        const seeder = new Seeder(
            dbService,
            userService,
            filesService,
            filePathsService,
            configService,
            apiConfigService
        );
        await seeder.start();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

start();
