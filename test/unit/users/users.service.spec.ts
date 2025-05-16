// test/unit/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../../../src/core/users/users.service';
import { UsersRepository } from '../../../src/core/users/users.repository';
import { HashingPasswordsService } from '../../../src/core/users/hashing-passwords.service';
import { SERIALIZATION_GROUPS, User } from '../../../src/core/users/entities/user.entity';
import {
    generateFakeUser,
    generateUnactivatedUsers,
    generateCreateUserDto,
    generateUpdateUserPasswordDto,
    generateUpdateUserDto,
    generateFakeProfilePictureName,
} from '../../fake-data/fake-users'
import { CompaniesService } from '../../../src/modules/companies/companies.service';
import { OrdersRepository } from '../../../src/modules/orders/orders.repository';

describe('UsersService', () => {
    let usersService: UsersService;
    let usersRepository: jest.Mocked<UsersRepository>;
    let passwordService: jest.Mocked<HashingPasswordsService>;
    let companiesService: jest.Mocked<CompaniesService>;
    let ordersRepository: jest.Mocked<OrdersRepository>;

    beforeEach(async () => {
        const usersRepositoryMock = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findAllUnactivatedUsers: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const passwordServiceMock = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        const companiesServiceMock = {
            findCompanyById: jest.fn(),
            findCompanyByOwnerId: jest.fn(),
        };

        const ordersRepositoryMock = {
            findByUserId: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: UsersRepository, useValue: usersRepositoryMock },
                { provide: HashingPasswordsService, useValue: passwordServiceMock },
                { provide: CompaniesService, useValue: companiesServiceMock },
                { provide: OrdersRepository, useValue: ordersRepositoryMock },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        // usersRepository = module.get(UsersRepository) as jest.Mocked<UsersRepository>;
        // passwordService = module.get(
        //     HashingPasswordsService
        // ) as jest.Mocked<HashingPasswordsService>;
        usersRepository = module.get(UsersRepository);
        passwordService = module.get(HashingPasswordsService);
        companiesService = module.get(CompaniesService);
        ordersRepository = module.get(OrdersRepository);
    });

    describe('findUserById', () => {
        it('should return a user by id with PRIVATE data', async () => {
            const testUser = generateFakeUser();
            usersRepository.findById.mockResolvedValue(testUser);

            const result = await usersService.findById(testUser.id);

            expect(usersRepository.findById).toHaveBeenCalledWith(testUser.id);
            expect(result).toEqual(
                plainToInstance(User, testUser, {
                    groups: SERIALIZATION_GROUPS.PRIVATE,
                })
            );
            expect(result.password).toBeDefined();
        });

        it('should throw NotFoundException if user is not found', async () => {
            usersRepository.findById.mockResolvedValue(null);
            const userId = 999;

            await expect(usersService.findById(userId)).rejects.toThrow(
                NotFoundException
            );
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
        });
    });

    describe('findUserByIdWithoutPassword', () => {
        it('should return a user by id without PRIVATE data', async () => {
            const testUser = generateFakeUser();
            usersRepository.findById.mockResolvedValue(testUser);

            const result = await usersService.findByIdWithoutPassword(testUser.id);

            expect(usersRepository.findById).toHaveBeenCalledWith(testUser.id);
            expect(result).toEqual(
                plainToInstance(User, testUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw NotFoundException if user is not found', async () => {
            usersRepository.findById.mockResolvedValue(null);
            const userId = 999;

            await expect(
                usersService.findByIdWithoutPassword(userId)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
        });
    });

    describe('findUserByEmail', () => {
        it('should return a user by email with PRIVATE data', async () => {
            const testUser = generateFakeUser();
            usersRepository.findByEmail.mockResolvedValue(testUser);

            const result = await usersService.findByEmail(testUser.email);

            expect(usersRepository.findByEmail).toHaveBeenCalledWith(testUser.email);
            expect(result).toEqual(
                plainToInstance(User, testUser, {
                    groups: SERIALIZATION_GROUPS.PRIVATE,
                })
            );
            expect(result.password).toBeDefined();
        });

        it('should throw NotFoundException if user is not found', async () => {
            const email = 'nonexistent@example.com';
            usersRepository.findByEmail.mockResolvedValue(null);

            await expect(usersService.findByEmail(email)).rejects.toThrow(
                NotFoundException
            );
            expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
        });
    });

    describe('findUserByEmailWithoutPassword', () => {
        it('should return a user by email without PRIVATE data', async () => {
            const testUser = generateFakeUser();
            usersRepository.findByEmail.mockResolvedValue(testUser);

            const result = await usersService.findByEmailWithoutPassword(
                testUser.email
            );

            expect(usersRepository.findByEmail).toHaveBeenCalledWith(testUser.email);
            expect(result).toEqual(
                plainToInstance(User, testUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw NotFoundException if user is not found', async () => {
            const email = 'nonexistent@example.com';
            usersRepository.findByEmail.mockResolvedValue(null);

            await expect(
                usersService.findByEmailWithoutPassword(email)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findByEmail).toHaveBeenCalledWith(email);
        });
    });

    describe('findAllUnactivatedUsers', () => {
        it('should return all unactivated users', async () => {
            const time = 3600; // 1 hour
            const unactivatedUsers =
                generateUnactivatedUsers(3, time);
            usersRepository.findAllUnactivated.mockResolvedValue(unactivatedUsers);

            const result = await usersService.findAllUnactivated(time);

            expect(usersRepository.findAllUnactivated).toHaveBeenCalledWith(time);
            expect(result).toHaveLength(unactivatedUsers.length);
            result.forEach((user, index) => {
                expect(user).toEqual(
                    plainToInstance(User, unactivatedUsers[index], {
                        groups: SERIALIZATION_GROUPS.PRIVATE,
                    })
                );
                expect(user.password).toBeDefined();
            });
        });

        it('should return an empty array if there are no unactivated users', async () => {
            const time = 3600;
            usersRepository.findAllUnactivated.mockResolvedValue([]);

            const result = await usersService.findAllUnactivated(time);

            expect(usersRepository.findAllUnactivated).toHaveBeenCalledWith(time);
            expect(result).toEqual([]);
        });
    });

    describe('createUser', () => {
        it('should create a new user and return it without PRIVATE data', async () => {
            const createUserDto = generateCreateUserDto();
            const hashedPassword = 'hashed_password_example';
            const createdUser = {
                ...generateFakeUser(),
                ...createUserDto,
                password: hashedPassword,
            };

            usersRepository.findByEmail.mockResolvedValue(null);
            passwordService.hash.mockResolvedValue(hashedPassword);
            usersRepository.create.mockResolvedValue(createdUser);

            const result = await usersService.create(createUserDto);

            expect(usersRepository.findByEmail).toHaveBeenCalledWith(
                createUserDto.email
            );
            expect(usersRepository.create).toHaveBeenCalledWith({
                ...createUserDto,
                password: hashedPassword,
            });
            expect(result).toEqual(
                plainToInstance(User, createdUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw ConflictException if email is already in use', async () => {
            const createUserDto = generateCreateUserDto();
            const existingUser = generateFakeUser();
            existingUser.email = createUserDto.email;

            usersRepository.findByEmail.mockResolvedValue(existingUser);

            await expect(usersService.create(createUserDto)).rejects.toThrow(
                ConflictException
            );
            expect(usersRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
            expect(passwordService.hash).not.toHaveBeenCalled();
            expect(usersRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('updateUser', () => {
        it('should update a user and return updated data without PRIVATE fields', async () => {
            const userId = 1;
            const updateUserDto = generateUpdateUserDto();
            const updatedUser = {
                ...generateFakeUser(),
                id: userId,
                ...updateUserDto,
            };

            usersRepository.update.mockResolvedValue(updatedUser);

            const result = await usersService.update(userId, updateUserDto);

            expect(usersRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
            expect(result).toEqual(
                plainToInstance(User, updatedUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw NotFoundException if user is not found during update', async () => {
            const userId = 999;
            const updateUserDto = generateUpdateUserDto();

            usersRepository.update.mockResolvedValue(null);

            await expect(
                usersService.update(userId, updateUserDto)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
        });
    });

    describe('updateUserPassword', () => {
        it('should update user password when old password matches', async () => {
            const userId = 1;
            const oldPassword = 'old_password';
            const newPassword = 'new_password';
            const hashedNewPassword = 'hashed_new_password';

            const updateUserPasswordDto = {
                oldPassword,
                newPassword,
            };

            const user = {
                ...generateFakeUser(),
                id: userId,
                password: 'hashed_old_password',
            };

            const updatedUser = { ...user, password: hashedNewPassword };

            usersRepository.findById.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(true);
            passwordService.hash.mockResolvedValue(hashedNewPassword);
            usersRepository.update.mockResolvedValue(updatedUser);

            const result = await usersService.updatePassword(
                userId,
                updateUserPasswordDto
            );

            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(passwordService.compare).toHaveBeenCalledWith(
                oldPassword,
                user.password
            );
            expect(passwordService.hash).toHaveBeenCalledWith(newPassword);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                password: hashedNewPassword,
            });
            expect(result).toEqual(
                plainToInstance(User, updatedUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw UnauthorizedException if old password does not match', async () => {
            const userId = 1;
            const updateUserPasswordDto =
                generateUpdateUserPasswordDto();
            const user = generateFakeUser();
            user.id = userId;

            usersRepository.findById.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(false);

            await expect(
                usersService.updatePassword(userId, updateUserPasswordDto)
            ).rejects.toThrow(UnauthorizedException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(passwordService.compare).toHaveBeenCalledWith(
                updateUserPasswordDto.oldPassword,
                user.password
            );
            expect(passwordService.hash).not.toHaveBeenCalled();
            expect(usersRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if user is not found when updating password', async () => {
            const userId = 999;
            const updateUserPasswordDto =
                generateUpdateUserPasswordDto();

            usersRepository.findById.mockResolvedValue(null);

            await expect(
                usersService.updatePassword(userId, updateUserPasswordDto)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(passwordService.compare).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if update fails after password hash', async () => {
            const userId = 1;
            const updateUserPasswordDto =
                generateUpdateUserPasswordDto();
            const user = generateFakeUser();
            user.id = userId;

            usersRepository.findById.mockResolvedValue(user);
            passwordService.compare.mockResolvedValue(true);
            passwordService.hash.mockResolvedValue('hashed_password');
            usersRepository.update.mockResolvedValue(null);

            await expect(
                usersService.updatePassword(userId, updateUserPasswordDto)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(passwordService.compare).toHaveBeenCalledWith(
                updateUserPasswordDto.oldPassword,
                user.password
            );
            expect(passwordService.hash).toHaveBeenCalledWith(
                updateUserPasswordDto.newPassword
            );
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                password: 'hashed_password',
            });
        });
    });

    describe('updateUserAvatar', () => {
        it('should update user avatar and return updated data', async () => {
            const userId = 1;
            const profilePictureName =
                generateFakeProfilePictureName();
            const user = generateFakeUser();
            user.id = userId;

            const updatedUser = { ...user, profilePictureName };

            usersRepository.findById.mockResolvedValue(user);
            usersRepository.update.mockResolvedValue(updatedUser);

            const result = await usersService.updateUserAvatar(
                userId,
                profilePictureName
            );

            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                profilePictureName,
            });
            expect(result).toEqual(
                plainToInstance(User, updatedUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.profilePictureName).toBe(profilePictureName);
            expect(result.password).toBeUndefined();
        });

        it('should throw NotFoundException if user not found for avatar update', async () => {
            const userId = 999;
            const profilePictureName =
                generateFakeProfilePictureName();

            usersRepository.findById.mockResolvedValue(null);

            await expect(
                usersService.updateUserAvatar(userId, profilePictureName)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(usersRepository.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if update fails during avatar update', async () => {
            const userId = 1;
            const profilePictureName =
                generateFakeProfilePictureName();
            const user = generateFakeUser();
            user.id = userId;

            usersRepository.findById.mockResolvedValue(user);
            usersRepository.update.mockResolvedValue(null);

            await expect(
                usersService.updateUserAvatar(userId, profilePictureName)
            ).rejects.toThrow(NotFoundException);
            expect(usersRepository.findById).toHaveBeenCalledWith(userId);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                profilePictureName,
            });
        });
    });

    describe('resetUserPassword', () => {
        it('should update user password and return updated data', async () => {
            const userId = 1;
            const newPassword = 'new_password';
            const hashedPassword = 'hashed_new_password';
            const user = generateFakeUser();
            user.id = userId;
            const updatedUser = { ...user, password: hashedPassword };

            passwordService.hash.mockResolvedValue(hashedPassword);
            usersRepository.update.mockResolvedValue(updatedUser);

            const result = await usersService.resetPassword(userId, newPassword);

            expect(passwordService.hash).toHaveBeenCalledWith(newPassword);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                password: hashedPassword,
            });
            expect(result).toEqual(
                plainToInstance(User, updatedUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });

        it('should throw NotFoundException if user is not found when updating password', async () => {
            const userId = 999;
            const newPassword = 'new_password';
            const hashedPassword = 'hashed_password';

            passwordService.hash.mockResolvedValue(hashedPassword);
            usersRepository.update.mockResolvedValue(null);

            await expect(
                usersService.resetPassword(userId, newPassword)
            ).rejects.toThrow(NotFoundException);
            expect(passwordService.hash).toHaveBeenCalledWith(newPassword);
            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                password: hashedPassword,
            });
        });
    });

    describe('confirmUserEmail', () => {
        it('should confirm user email and return updated data', async () => {
            const userId = 1;
            const user = generateFakeUser();
            user.id = userId;
            user.isEmailVerified = false;
            const updatedUser = { ...user, isEmailVerified: true };

            usersRepository.update.mockResolvedValue(updatedUser);

            const result = await usersService.confirmEmail(userId);

            expect(usersRepository.update).toHaveBeenCalledWith(userId, {
                isEmailVerified: true,
            });
            expect(result).toEqual(
                plainToInstance(User, updatedUser, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                })
            );
            expect(result.password).toBeUndefined();
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            const userId = 1;
            usersRepository.delete.mockResolvedValue(undefined);

            await usersService.delete(userId);

            expect(usersRepository.delete).toHaveBeenCalledWith(userId);
        });

        it('should propagate error if deletion fails', async () => {
            const userId = 1;
            const error = new Error('Database error');
            usersRepository.delete.mockRejectedValue(error);

            await expect(usersService.delete(userId)).rejects.toThrow(error);
            expect(usersRepository.delete).toHaveBeenCalledWith(userId);
        });
    });
});
