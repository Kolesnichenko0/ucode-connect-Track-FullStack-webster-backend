// prisma/seeds/services/users-creation.service.ts
import { faker } from '@faker-js/faker';
import { FileTargetType } from '@prisma/client';
import { BaseSeederService } from '../core/base-seeder.service';
import { SEED_CONSTANTS } from '../../constants/seed.constants';
import {
    UPLOAD_ALLOWED_FILE_MIME_TYPES,
    UPLOAD_ALLOWED_MAX_FILE_SIZES
} from '../../../../src/core/file-upload/constants/file-upload.contsants';
import { fromBuffer } from 'file-type';
import { buildUrl, downloadFileFromUrl } from '../../../../src/common/utils';

interface CreateUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isMale: boolean;
    shouldHaveCustomAvatar: boolean;
}

export class UsersCreationService {
    private baseSeeder: BaseSeederService;

    constructor() {
        this.baseSeeder = BaseSeederService.getInstance();
    }

    async createUsers(): Promise<void> {
        console.log('👥 Starting users creation...');

        const users = this.generateUsersData();
        const usersWithCustomAvatars = users.filter(user => user.shouldHaveCustomAvatar);

        if (usersWithCustomAvatars.length > 0) {
            console.log(
                `📷 ${usersWithCustomAvatars.length} users will get custom avatars from Avatar Iran service`
            );
        }

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const userNumber = i + 1;

            try {
                console.log(
                    `👤 Creating user ${userNumber}/${users.length}: ${user.email}`
                );

                const createdUser = await this.baseSeeder.usersService.create({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password,
                });

                if (user.shouldHaveCustomAvatar) {
                    await this.uploadUserAvatar(createdUser.id, user.isMale);
                }

                if (userNumber === 1 || userNumber % 2 === 0) {
                    await this.baseSeeder.usersRepository.update(createdUser.id, {
                        isEmailVerified: true
                    });
                }

                console.log(
                    `✅ User ${userNumber} created successfully: ${user.email}${
                        user.shouldHaveCustomAvatar ? ' (with custom avatar)' : ''
                    }`
                );
            } catch (error) {
                console.error(
                    `❌ Failed to create user ${userNumber}: ${user.email}`,
                    error
                );
            }
        }

        console.log('👥 Users creation completed!');
    }

    private generateUsersData(): CreateUserData[] {
        const { TOTAL, PASSWORD, GENDER_PROBABILITY, AVATAR_PROBABILITY, TEST_USER } =
            SEED_CONSTANTS.USERS;
        const { DOMAIN } = SEED_CONSTANTS.PRODUCT;

        const users: CreateUserData[] = [];

        users.push({
            firstName: TEST_USER.FIRST_NAME,
            lastName: TEST_USER.LAST_NAME,
            email: `${TEST_USER.EMAIL_PREFIX}@${DOMAIN}`,
            password: PASSWORD,
            isMale: false,
            shouldHaveCustomAvatar: false,
        });

        for (let i = 1; i < TOTAL; i++) {
            const isMale = faker.datatype.boolean({ probability: GENDER_PROBABILITY });
            const firstName = faker.person.firstName(isMale ? 'male' : 'female');
            const lastName = faker.person.lastName(isMale ? 'male' : 'female');
            const shouldHaveCustomAvatar = faker.datatype.boolean({
                probability: AVATAR_PROBABILITY
            });

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
                shouldHaveCustomAvatar,
            });
        }

        return users;
    }

    private async uploadUserAvatar(userId: number, isMale: boolean): Promise<void> {
        try {
            const { BASE_URL, ENDPOINTS, FORMAT } = SEED_CONSTANTS.USER_AVATAR_SERVICE;
            const endpoint = isMale ? ENDPOINTS.BOY : ENDPOINTS.GIRL;
            const avatarUrl = buildUrl(BASE_URL, endpoint);

            console.log(`📷 Downloading avatar from: ${avatarUrl}`);

            const buffer = await downloadFileFromUrl(avatarUrl) as Buffer;

            if (buffer.length > UPLOAD_ALLOWED_MAX_FILE_SIZES.USER_AVATAR) {
                throw new Error(
                    `Avatar too large (${buffer.length} bytes), max allowed: ${UPLOAD_ALLOWED_MAX_FILE_SIZES.USER_AVATAR}`
                );
            }

            const imageBufferResponse = await fromBuffer(buffer);
            if (!imageBufferResponse) {
                throw new Error('Unable to determine mime type for avatar');
            }

            const allowedMimeTypes: string[] = [
                ...UPLOAD_ALLOWED_FILE_MIME_TYPES.USER_AVATAR
            ];

            if (!allowedMimeTypes.includes(imageBufferResponse.mime)) {
                throw new Error(
                    `Invalid mime type: ${imageBufferResponse.mime}`
                );
            }

            const multerFile: Express.Multer.File = {
                originalname: `avatar-${userId}.${FORMAT}`,
                mimetype: imageBufferResponse.mime,
                buffer: buffer,
            } as Express.Multer.File;

            const result = await this.baseSeeder.fileUploadService.upload(
                multerFile,
                {
                    authorId: userId,
                    targetType: FileTargetType.USER_AVATAR,
                    targetId: userId,
                    isDefault: false,
                }
            );

            await this.baseSeeder.usersRepository.update(userId, {
                avatarFileId: result.fileId
            });

            console.log(
                `✅ Avatar uploaded for user ${userId} (${buffer.length} bytes)`
            );
        } catch (error) {
            console.error(`❌ Failed to upload avatar for user ${userId}:`, error);
        }
    }
}
