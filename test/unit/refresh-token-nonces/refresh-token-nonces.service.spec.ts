// test/unit/refresh-token-nonces/refresh-token-nonces.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RefreshTokenNoncesService } from '../../../src/core/refresh-token-nonces/refresh-token-nonces.service';
import { RefreshTokenNoncesRepository } from '../../../src/core/refresh-token-nonces/refresh-token-nonces.repository';
import { RefreshTokenNonce } from '../../../src/core/refresh-token-nonces/entities/refresh-token-nonce.entity';
import { CreateRefreshTokenNonceDto } from '../../../src/core/refresh-token-nonces/dto/create-refresh-nonce.dto';
import { generateFakeRefreshTokenNonce } from '../../fake-data/fake-refresh-token-nonces';

describe('RefreshTokenNoncesService', () => {
    let nonceService: RefreshTokenNoncesService;
    let nonceRepository: RefreshTokenNoncesRepository;

    beforeEach(async () => {
        const nonceRepositoryMock = {
            getAll: jest.fn(),
            findByRefreshTokenNonceAndUserId: jest.fn(),
            saveRefreshTokenNonce: jest.fn(),
            deleteRefreshTokenNoncesByUserId: jest.fn(),
            deleteRefreshTokenNonceById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RefreshTokenNoncesService,
                {
                    provide: RefreshTokenNoncesRepository,
                    useValue: {
                        findAll: jest.fn(),
                        findByNonceAndUserId: jest.fn(),
                        create: jest.fn(),
                        deleteByUserId: jest.fn(),
                        deleteById: jest.fn(),
                    },
                },
            ],
        }).compile();

        nonceService = module.get<RefreshTokenNoncesService>(RefreshTokenNoncesService);
        nonceRepository = module.get<RefreshTokenNoncesRepository>(RefreshTokenNoncesRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return all refresh token nonces when time parameter is provided', async () => {
            // Arrange
            const seconds = 3600;
            const fakeNonces: RefreshTokenNonce[] = [
                generateFakeRefreshTokenNonce(),
                generateFakeRefreshTokenNonce(),
            ];
            jest.spyOn(nonceRepository, 'findAll').mockResolvedValue(fakeNonces);

            // Act
            const result = await nonceService.findAll(seconds);

            // Assert
            expect(result).toEqual(fakeNonces);
            expect(nonceRepository.findAll).toHaveBeenCalledWith(seconds);
        });

        it('should return all refresh token nonces when time parameter is not provided', async () => {
            // Arrange
            const fakeNonces: RefreshTokenNonce[] = [generateFakeRefreshTokenNonce()];
            jest.spyOn(nonceRepository, 'findAll').mockResolvedValue(fakeNonces);

            // Act
            const result = await nonceService.findAll();

            // Assert
            expect(result).toEqual(fakeNonces);
            expect(nonceRepository.findAll).toHaveBeenCalledWith(undefined);
        });
    });

    describe('getRefreshTokenNonceByNonceAndUserId', () => {
        it('should return a refresh token nonce when found', async () => {
            // Arrange
            const userId = 1;
            const nonce = 'testNonce';
            const fakeNonce = generateFakeRefreshTokenNonce({ userId, nonce });
            jest.spyOn(nonceRepository, 'findByNonceAndUserId').mockResolvedValue(fakeNonce);

            // Act
            const result = await nonceService.findByNonceAndUserId(userId, nonce);

            // Assert
            expect(result).toEqual(fakeNonce);
            expect(nonceRepository.findByNonceAndUserId).toHaveBeenCalledWith(userId, nonce);
        });

        it('should throw NotFoundException when nonce is not found', async () => {
            // Arrange
            const userId = 1;
            const nonce = 'nonexistentNonce';
            jest.spyOn(nonceRepository, 'findByNonceAndUserId').mockResolvedValue(null);

            // Act & Assert
            await expect(
                nonceService.findByNonceAndUserId(userId, nonce)
            ).rejects.toThrow(NotFoundException);
            expect(nonceRepository.findByNonceAndUserId).toHaveBeenCalledWith(userId, nonce);
        });
    });

    describe('createRefreshTokenNonce', () => {
        it('should create and return a refresh token nonce', async () => {
            // Arrange
            const createDto = {
                userId: 1,
                nonce: 'newNonce',
            };
            const createdNonce = generateFakeRefreshTokenNonce({ userId: createDto.userId, nonce: createDto.nonce });
            jest.spyOn(nonceRepository, 'create').mockResolvedValue(createdNonce);

            // Act
            const result = await nonceService.create(createDto);

            // Assert
            expect(result).toEqual(createdNonce);
            expect(nonceRepository.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('deleteRefreshTokenNoncesByUserId', () => {
        it('should delete all refresh token nonces for a given user', async () => {
            // Arrange
            const userId = 1;
            jest.spyOn(nonceRepository, 'deleteByUserId').mockResolvedValue();

            // Act
            const result = await nonceService.deleteByUserId(userId);

            // Assert
            expect(result).toBeUndefined();
            expect(nonceRepository.deleteByUserId).toHaveBeenCalledWith(userId);
        });
    });

    describe('deleteRefreshTokenNonceByNonceId', () => {
        it('should delete a refresh token nonce by its id', async () => {
            // Arrange
            const nonceId = 100;
            jest.spyOn(nonceRepository, 'deleteById').mockResolvedValue();

            // Act
            const result = await nonceService.deleteById(nonceId);

            // Assert
            expect(result).toBeUndefined();
            expect(nonceRepository.deleteById).toHaveBeenCalledWith(nonceId);
        });
    });
});
