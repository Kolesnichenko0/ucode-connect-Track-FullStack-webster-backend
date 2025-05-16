// prisma/seeds/users.ts
import { SEEDS } from './seed-constants';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function getRandomAvatar(id: number, gender: boolean): Promise<string> {
    const avatarUrl = `https://avatar.iran.liara.run/public/${gender ? 'boy' : 'girl'}`;

    try {
        const response = await axios.get(avatarUrl, {
            responseType: 'arraybuffer',
            timeout: 5000,
        });

        const buffer = Buffer.from(response.data);

        const publicDir = path.join(process.cwd(), 'public', 'uploads', 'user-avatars');
        await fs.mkdir(publicDir, { recursive: true });

        const fileName = `user-avatar-${id}.png`;
        const filePath = path.join(publicDir, fileName);

        await fs.writeFile(filePath, buffer);

        return fileName;
    } catch (error) {
        console.error('Error fetching or saving avatar for user', id, error);
        return 'default-avatar.png';
    }
}

export const createInitialUsers = async () => {
    const initialUsers = [
        {
            gender: false,
            firstName: 'Test',
            lastName: 'User',
            email: `test.user@${SEEDS.PRODUCT.DOMAIN}`,
            password: SEEDS.USERS.PASSWORD,
            isEmailVerified: true,
            profilePictureName: SEEDS.USERS.GENERATE_AVATARS ? await getRandomAvatar(1, false) : SEEDS.USERS.AVATAR_MASK.replace('*', '1'),
        },
        ...await Promise.all(Array.from({ length: SEEDS.USERS.TOTAL - 1 }, async (_, index) => {
            const gender: boolean = faker.datatype.boolean({ probability: SEEDS.USERS.GENDER_PROBABILITY });
            const firstName = faker.person.firstName(gender ? 'male' : 'female');
            const lastName = faker.person.lastName(gender ? 'male' : 'female');
            const id = index + 2;
            const profilePictureName = SEEDS.USERS.GENERATE_AVATARS ? await getRandomAvatar(id, gender) : SEEDS.USERS.AVATAR_MASK.replace('*', String(id));
            
            return {
                gender,
                firstName,
                lastName,
                email: faker.internet.email({
                    firstName,
                    lastName,
                    provider: SEEDS.PRODUCT.DOMAIN,
                    allowSpecialCharacters: false,
                }).toLowerCase(),
                password: SEEDS.USERS.PASSWORD,
                isEmailVerified: true,
                profilePictureName: profilePictureName,
            };
        })),
    ];

    return initialUsers;
};
