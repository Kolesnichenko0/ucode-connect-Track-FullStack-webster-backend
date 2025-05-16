// test/unit/users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
    BadRequestException,
    NotFoundException,
    NotImplementedException,
} from '@nestjs/common';
import { UsersController } from '../../../src/core/users/users.controller';
import { UsersService } from '../../../src/core/users/users.service';
import * as UsersFaker from '../../../test/fake-data/fake-users';
import { User } from '../../../src/core/users/entities/user.entity';
import { GetUsersDto } from '../../../src/core/users/dto/get-users.dto';
import { SubscriptionsService } from '../../../src/modules/subscriptions/subscriptions.service';
import { OrdersService } from '../../../src/modules/orders/orders.service';
import { NotificationsService } from '../../../src/modules/notifications/notifications.service';
import { UpdateUserDto } from '../../../src/core/users/dto/update-user.dto';
import { Company } from '../../../src/modules/companies/entities/company.entity';
import { Order } from '../../../src/modules/orders/entities/order.entity';
import { Notification } from '../../../src/modules/notifications/entities/notification.entity';

interface SubscriptionWithEvents {
    id: number;
    userId: number;
    eventId: number;
    createdAt: Date;
    updatedAt: Date;
    event: any;
}

interface SubscriptionWithCompanies {
    id: number;
    userId: number;
    companyId: number;
    createdAt: Date;
    updatedAt: Date;
    company: any;
}

describe('UsersController', () => {
    let usersController: UsersController;
    let usersService: jest.Mocked<UsersService>;
    let subscriptionsService: jest.Mocked<SubscriptionsService>;
    let ordersService: jest.Mocked<OrdersService>;
    let notificationsService: jest.Mocked<NotificationsService>;

    const mockUser = UsersFaker.generateFakeUser();
    const mockUsers = [mockUser, UsersFaker.generateFakeUser()];

    const mockCompany: Company = {
        id: 1,
        ownerId: mockUser.id,
        email: 'company@test.com',
        title: 'Test Company',
        description: 'Test Description',
        logoName: 'default-logo.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockOrder: Order = {
        id: 1,
        userId: mockUser.id,
        promoCodeId: null,
        paymentStatus: 'PENDING',
        paymentMethod: 'STRIPE',
        totalAmount: 100,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockNotification: Notification = {
        id: 1,
        userId: mockUser.id,
        eventId: 1,
        companyId: 1,
        title: 'Test Notification',
        content: 'Test Content',
        readAt: null,
        hiddenAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockEventSubscription: SubscriptionWithEvents = {
        id: 1,
        userId: mockUser.id,
        eventId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        event: null
    };

    const mockCompanySubscription: SubscriptionWithCompanies = {
        id: 1,
        userId: mockUser.id,
        companyId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: null
    };

    beforeEach(async () => {
        const usersServiceMock = {
            createUser: jest.fn(),
            findUserByIdWithConfidential: jest.fn(),
            findUserByIdWithoutPassword: jest.fn(),
            findUserById: jest.fn(),
            findAllUsers: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            findUserByEmailWithoutPassword: jest.fn(),
            updateUserPassword: jest.fn(),
            updateUserAvatar: jest.fn(),
            findUserCompanies: jest.fn(),
        };

        const subscriptionsServiceMock = {
            findAllByUserIdForEvents: jest.fn(),
            findAllByUserIdForCompanies: jest.fn(),
        };

        const ordersServiceMock = {
            findOrdersWithDetailsByUserId: jest.fn(),
        };

        const notificationsServiceMock = {
            findAll: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: UsersService, useValue: usersServiceMock },
                { provide: SubscriptionsService, useValue: subscriptionsServiceMock },
                { provide: OrdersService, useValue: ordersServiceMock },
                { provide: NotificationsService, useValue: notificationsServiceMock },
            ],
        }).compile();

        usersController = module.get<UsersController>(UsersController);
        usersService = module.get(UsersService);
        subscriptionsService = module.get(SubscriptionsService);
        ordersService = module.get(OrdersService);
        notificationsService = module.get(NotificationsService);
    });

    describe('findMe', () => {
        it('should return current user data', async () => {
            usersService.findByIdWithConfidential.mockResolvedValue(mockUser);

            const result = await usersController.findMe(mockUser.id);

            expect(result).toBe(mockUser);
            expect(usersService.findByIdWithConfidential).toHaveBeenCalledWith(mockUser.id);
        });
    });

    describe('findOneByEmail (GET /users?email=...)', () => {
        it('should throw BadRequestException if email is not provided', async () => {
            await expect(usersController.findAll(null as unknown as GetUsersDto)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should return user by email without PRIVATE data', async () => {
            const testUser: User = UsersFaker.generateFakeUser();
            usersService.findByEmailWithoutPassword.mockResolvedValue(testUser);

            const result = await usersController.findAll({email: testUser.email});
            expect(usersService.findByEmailWithoutPassword).toHaveBeenCalledWith(
                testUser.email,
            );
            expect(result).toEqual(testUser);
        });
    });

    describe('findOne', () => {
        it('should return user by id', async () => {
            usersService.findByIdWithoutPassword.mockResolvedValue(mockUser);

            const result = await usersController.findById(mockUser.id);

            expect(result).toBe(mockUser);
            expect(usersService.findByIdWithoutPassword).toHaveBeenCalledWith(mockUser.id);
        });
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const getUsersDto: GetUsersDto = { email: 'test@test.com' };
            usersService.findAll.mockResolvedValue(mockUsers);

            const result = await usersController.findAll(getUsersDto);

            expect(result).toBe(mockUsers);
            expect(usersService.findAll).toHaveBeenCalledWith(getUsersDto);
        });
    });

    describe('findUserCompanies', () => {
        it('should return user companies', async () => {
            const mockCompanies = [mockCompany];
            usersService.findUserCompanies.mockResolvedValue(mockCompanies);

            const result = await usersController.findUserCompanies(mockUser.id);

            expect(result).toBe(mockCompanies);
            expect(usersService.findUserCompanies).toHaveBeenCalledWith(mockUser.id);
        });
    });

    describe('findUserEventSubscriptions', () => {
        it('should return user event subscriptions', async () => {
            const mockSubscriptions = [mockEventSubscription];
            subscriptionsService.findAllByUserIdForEvents.mockResolvedValue(mockSubscriptions);

            const result = await usersController.findUserEventSubscriptions(mockUser.id);

            expect(result).toBe(mockSubscriptions);
            expect(subscriptionsService.findAllByUserIdForEvents).toHaveBeenCalledWith(mockUser.id);
        });
    });

    describe('findUserCompanySubscriptions', () => {
        it('should return user company subscriptions', async () => {
            const mockSubscriptions = [mockCompanySubscription];
            subscriptionsService.findAllByUserIdForCompanies.mockResolvedValue(mockSubscriptions);

            const result = await usersController.findUserCompanySubscriptions(mockUser.id);

            expect(result).toBe(mockSubscriptions);
            expect(subscriptionsService.findAllByUserIdForCompanies).toHaveBeenCalledWith(mockUser.id);
        });
    });

    describe('findUserOrders', () => {
        it('should return user orders', async () => {
            const mockOrders = [mockOrder];
            usersService.findById.mockResolvedValue(mockUser);
            ordersService.findOrdersWithDetailsByUserId.mockResolvedValue(mockOrders);

            const result = await usersController.findUserOrders(mockUser.id);

            expect(result).toBe(mockOrders);
            expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
            expect(ordersService.findOrdersWithDetailsByUserId).toHaveBeenCalledWith(mockUser.id);
        });
    });

    describe('getNotifications', () => {
        const mockNotifications = [
            {
                id: 1,
                userId: 1,
                title: 'Test Notification',
                content: 'Test Content',
                eventId: 1,
                companyId: null,
                readAt: null,
                hiddenAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                event: {
                    id: 1,
                    title: 'Test Event'
                },
                company: null
            } as any,
            {
                id: 2,
                userId: 1,
                title: 'Company Notification',
                content: 'Company Content',
                eventId: null,
                companyId: 1,
                readAt: new Date(),
                hiddenAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                event: null,
                company: {
                    id: 1,
                    title: 'Test Company'
                }
            } as any
        ];

        it('should return user notifications with event and company details', async () => {
            notificationsService.findAll.mockResolvedValue(mockNotifications);

            const result = await usersController.findUserNotifications(mockUser.id);

            expect(result).toEqual(mockNotifications);
            expect(notificationsService.findAll).toHaveBeenCalledWith(mockUser.id);
            expect(result[0].event).toBeDefined();
            expect(result[0].company).toBeNull();
            expect(result[1].event).toBeNull();
            expect(result[1].company).toBeDefined();
        });

        it('should return empty array when user has no notifications', async () => {
            notificationsService.findAll.mockResolvedValue([]);

            const result = await usersController.findUserNotifications(mockUser.id);

            expect(result).toEqual([]);
            expect(notificationsService.findAll).toHaveBeenCalledWith(mockUser.id);
        });
    });
    describe('findOne (GET /users/:id)', () => {
        it('should return user by id without PRIVATE data', async () => {
            const testUser: User = UsersFaker.generateFakeUser();
            usersService.findByIdWithoutPassword.mockResolvedValue(testUser);

            const id = testUser.id;
            const dummyUserId = 123;

            const result = await usersController.findById(id);
            expect(usersService.findByIdWithoutPassword).toHaveBeenCalledWith(id);
            expect(result).toEqual(testUser);
        });

        it('should throw NotFoundException if user is not found', async () => {
            const id = 999;
            const dummyUserId = 123;
            usersService.findByIdWithoutPassword.mockResolvedValue(null as unknown as User);
            await expect(usersController.findById(id)).rejects.toThrow(
                NotFoundException,
            );
            expect(usersService.findByIdWithoutPassword).toHaveBeenCalledWith(id);
        });

        it('should handle error when notification service fails', async () => {
            notificationsService.findAll.mockRejectedValue(new Error('Database error'));

            await expect(usersController.findUserNotifications(mockUser.id))
                .rejects
                .toThrow('Database error');
        });
    });

    // describe('create (POST /users)', () => {
    //     it('should throw NotImplementedException when called', async () => {
    //         const createUserDto = UsersFaker.generateCreateUserDto();
    //         const dummyUserId = 123;
    //         await expect(
    //             usersController.createUser(createUserDto, dummyUserId),
    //         ).rejects.toThrow(NotImplementedException);
    //     });
    // });

    describe('update (PATCH /users/:id)', () => {
        it('should update user and return updated data', async () => {
            const id = 1;
            const dummyUserId = 123;
            const updateUserDto = UsersFaker.generateUpdateUserDto();

            const existingUser: User = UsersFaker.generateFakeUser();
            const updatedUser: User = { ...existingUser, ...updateUserDto };

            usersService.findByIdWithoutPassword.mockResolvedValue(existingUser);
            usersService.update.mockResolvedValue(updatedUser);

            const result = await usersController.update(id, updateUserDto, dummyUserId);
            expect(usersService.findByIdWithoutPassword).toHaveBeenCalledWith(id);
            expect(usersService.update).toHaveBeenCalledWith(id, updateUserDto);
            expect(result).toEqual(updatedUser);
        });

        it('should update user data', async () => {
            const updateUserDto: UpdateUserDto = { firstName: 'New Name' };
            usersService.update.mockResolvedValue({ ...mockUser, ...updateUserDto });

            const result = await usersController.update(mockUser.id, updateUserDto, mockUser.id);

            expect(result).toEqual({ ...mockUser, ...updateUserDto });
            expect(usersService.update).toHaveBeenCalledWith(mockUser.id, updateUserDto);
        });
    });

    describe('updatePassword (PATCH /users/:id/password)', () => {
        it('should update user password and return updated data', async () => {
            const id = 1;
            const updateUserPasswordDto = UsersFaker.generateUpdateUserPasswordDto();
            const updatedUser: User = UsersFaker.generateFakeUser();
            usersService.updatePassword.mockResolvedValue(updatedUser);

            const result = await usersController.updatePassword(id, updateUserPasswordDto);
            expect(usersService.updatePassword).toHaveBeenCalledWith(
                id,
                updateUserPasswordDto,
            );
            expect(result).toEqual(updatedUser);
        });

        it('should propagate error if service.updateUserPassword throws error', async () => {
            const id = 1;
            const updateUserPasswordDto = UsersFaker.generateUpdateUserPasswordDto();
            const error = new NotFoundException('User not found');
            usersService.updatePassword.mockRejectedValue(error);

            await expect(
                usersController.updatePassword(id, updateUserPasswordDto),
            ).rejects.toThrow(error);
            expect(usersService.updatePassword).toHaveBeenCalledWith(
                id,
                updateUserPasswordDto,
            );
        });

        it('should throw NotFoundException when user not found', async () => {
            usersService.findById.mockResolvedValue(null as unknown as User);

            await expect(usersController.findUserOrders(-1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('uploadAvatar (POST /users/:id/upload-avatar)', () => {
        it('should update user avatar and return file info when file is provided', async () => {
            const id = 1;
            const fileMock = {
                fieldname: 'file',
                originalname: 'avatar.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 1024,
                destination: './public/uploads/user-avatars',
                filename: 'avatar-uuid.jpg',
                path: './public/uploads/user-avatars/avatar-uuid.jpg',
                buffer: Buffer.from('test'),
                stream: jest.fn() as any
            } as Express.Multer.File;

            const result = await usersController.uploadAvatar(fileMock, id);
            expect(usersService.updateUserAvatar).toHaveBeenCalledWith(
                id,
                fileMock.filename,
            );
            expect(result).toEqual({ server_filename: fileMock.filename });
        });

        it('should throw BadRequestException if no file is uploaded', async () => {
            const id = 1;
            await expect(usersController.uploadAvatar(undefined as any, id)).rejects.toThrow(
                BadRequestException,
            );
            expect(usersService.updateUserAvatar).not.toHaveBeenCalled();
        });
    });

    // describe('delete (DELETE /users/:id)', () => {
    //     it('should throw NotImplementedException when delete is called', async () => {
    //         const id = 1;
    //         const dummyUserId = 123;
    //         await expect(usersController.deleteUser(id, dummyUserId)).rejects.toThrow(
    //             NotImplementedException,
    //         );
    //     });
    // });
});
