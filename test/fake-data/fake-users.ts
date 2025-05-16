// test/fake-data/fake-users.ts
import { User } from '../../src/core/users/entities/user.entity';
import { faker } from '@faker-js/faker';
import { CreateUserDto } from '../../src/core/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/core/users/dto/update-user.dto';
import { UpdateUserPasswordDto } from '../../src/core/users/dto/update-user-password.dto';
import { UserRole } from '@prisma/client';

export function generateFakeFirstName(): string {
    return faker.person.firstName();
}

export function generateFakeLastName(): string {
    return faker.person.lastName();
}

export function generateFakeEmail(firstName: string, lastName: string): string {
    return faker.internet.email({
        firstName,
        lastName,
        provider: 'example.com',
        allowSpecialCharacters: false,
    });
}

export function generateFakePassword(): string {
    return 'Password123!$';
}

export function generateFakeProfilePictureName(): string {
    return `profile-${faker.string.uuid()}.jpg`;
}

export function generateFakeUser<K extends keyof User>(
    allFields = true,
    fields: K[] = [],
): Pick<User, K> {
    const firstName = generateFakeFirstName();
    const lastName = generateFakeLastName();

    const fakeUser: User = {
        id: faker.number.int({ min: 1, max: 1000 }),
        firstName,
        lastName,
        email: generateFakeEmail(firstName, lastName),
        password: generateFakePassword(),
        profilePictureName: generateFakeProfilePictureName(),
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokenNonces: [],
        role: UserRole.USER,
    };

    if (allFields) {
        return fakeUser;
    }

    const user = {} as Pick<User, K>;

    fields.forEach((field) => {
        user[field] = fakeUser[field];
    });

    return user;
}

export function pickUserFields<T extends User, K extends keyof T>(
    obj: T,
    fields: K[],
): Pick<T, K> {
    const result = {} as Pick<T, K>;

    fields.forEach((field) => {
        if (field in obj) {
            result[field] = obj[field];
        }
    });

    return result;
}

export function generateFakeUserWithFields<K extends keyof User>(
    fields: K[],
): Pick<User, K> {
    const fakeUser = this.generateFakeUser();
    return this.pickUserFields(fakeUser, fields);
}

export function generateFakeUsers(count: number): User[] {
    return Array.from({ length: count }).map(() => this.generateFakeUser());
}

export function generateCreateUserDto(): CreateUserDto {
    const firstName = this.generateFakeFirstName();
    const lastName = this.generateFakeLastName();
    return {
        firstName,
        lastName,
        email: this.generateFakeEmail(firstName, lastName),
        password: this.generateFakePassword(),
    };
}

export function generateUpdateUserDto(): UpdateUserDto {
    return {
        firstName: this.generateFakeFirstName(),
        lastName: this.generateFakeLastName(),
    };
}

export function generateUpdateUserPasswordDto(): UpdateUserPasswordDto {
    return {
        oldPassword: this.generateFakePassword(),
        newPassword: 'NewPassword123!$',
    };
}
export function generateUnactivatedUsers(
    count: number,
    seconds: number,
): User[] {
    const thresholdDate = new Date();
    thresholdDate.setSeconds(thresholdDate.getSeconds() - seconds);
    return Array.from({ length: count }, () => {
        const user = this.generateFakeUser();
        user.isEmailVerified = false;
        user.createdAt = new Date(
            thresholdDate.getTime() -
                faker.number.int({ min: 1000, max: 10000 }),
        );
        return user;
    });
}

