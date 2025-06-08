// src/core/users/users.service.ts
import {
    ConflictException,
    ImATeapotException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
    SERIALIZATION_GROUPS,
    User,
} from './entities/user.entity';
import { HashingPasswordsService } from './hashing-passwords.service';
import { plainToInstance } from 'class-transformer';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { FileTargetType } from '@prisma/client';
import { UploadFileDto } from '../file-upload/dto/upload-file.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import { FilesService } from '../files/files.service';
import { FileUrlTransformerService } from '../files/file-url-transformer.service';

@Injectable()
export class UsersService {

    private readonly TARGET_TYPE = FileTargetType.USER_AVATAR;

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly passwordService: HashingPasswordsService,
        private readonly fileUploadService: FileUploadService,
        private readonly filesService: FilesService,
        private readonly fileUrlTransformerService: FileUrlTransformerService,
    ) { }

    private async getDefaultAvatarId(): Promise<number> {
        const avatarFile = await this.filesService.findAllDefaultsByTargetType(this.TARGET_TYPE);
        if (!avatarFile || avatarFile.length === 0) {
            throw new ImATeapotException('Default avatar file not found');
        }
        return avatarFile[0].id;
    }

    async create(dto: CreateUserDto): Promise<User> {
        const existing = await this.usersRepository.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already in use');
        }
        dto.password = await this.passwordService.hash(dto.password);

        const result = await this.usersRepository.create({...dto, avatarFileId: await this.getDefaultAvatarId()});

        const transformedResult = await this.fileUrlTransformerService.transform(
            result,
            [FileUrlTransformerService.COMMON_CONFIGS.USER_AVATAR],
        );

        return plainToInstance(User, transformedResult, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async findAllUnactivatedByCreatedAt(createdBefore: Date): Promise<User[]> {
        const users = await this.usersRepository.findAllUnactivatedByCreatedAt(createdBefore);
        return users.map((user) =>
            plainToInstance(User, user, {
                groups: SERIALIZATION_GROUPS.PRIVATE,
            }),
        );
    }

    async findAll(getUsersDto: GetUsersDto): Promise<User[]> {
        const users = await this.usersRepository.findAll(getUsersDto);

        const transformedUsers = await this.fileUrlTransformerService.transform(
            users,
            [FileUrlTransformerService.COMMON_CONFIGS.USER_AVATAR],
        );

        return (transformedUsers as User[]).map((user) =>
            plainToInstance(User, user, {
                groups: SERIALIZATION_GROUPS.BASIC,
            }),
        );
    }

    public async findById(
        id: number,
        serializationGroup: string[] = SERIALIZATION_GROUPS.PRIVATE,
    ): Promise<User> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const transformedUser = await this.fileUrlTransformerService.transform(
            user,
            [FileUrlTransformerService.COMMON_CONFIGS.USER_AVATAR],
        );

        return plainToInstance(User, transformedUser, {
            groups: serializationGroup,
        });
    }

    public async findByIdWithAvatar(
        id: number,
        serializationGroup: string[] = SERIALIZATION_GROUPS.PRIVATE,
    ): Promise<User> {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return plainToInstance(User, user, {
            groups: serializationGroup,
        });
    }

    async findByIdWithoutPassword(id: number): Promise<User> {
        return this.findById(id, SERIALIZATION_GROUPS.BASIC);
    }

    async findByIdWithConfidential(id: number): Promise<User> {
        return await this.findById(id, SERIALIZATION_GROUPS.CONFIDENTIAL);
    }

    async findByEmail(email: string): Promise<User> {
        const result = await this.usersRepository.findByEmail(email);
        if (!result) {
            throw new NotFoundException('User with this email not found');
        }

        const transformedResult = await this.fileUrlTransformerService.transform(
            result,
            [FileUrlTransformerService.COMMON_CONFIGS.USER_AVATAR],
        );

        return plainToInstance(User, transformedResult, {
            groups: SERIALIZATION_GROUPS.PRIVATE,
        });
    }

    async findByEmailWithoutPassword(email: string): Promise<User> {
        const result = await this.findByEmail(email);
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.BASIC,
        });
    }

    async update(id: number, dto: UpdateUserDto): Promise<User> {
        await this.findById(id);
        const result = await this.usersRepository.update(id, dto);
        if (!result) {
            throw new NotFoundException('User not found');
        }

        const transformedUser = await this.fileUrlTransformerService.transform(
            result,
            [FileUrlTransformerService.COMMON_CONFIGS.USER_AVATAR],
        );

        return plainToInstance(User, transformedUser, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async updatePassword(
        id: number,
        dto: UpdateUserPasswordDto,
    ): Promise<User> {
        const user = await this.findById(id);

        const isMatch = user.password ?
        await this.passwordService.compare(
            dto.oldPassword,
            user.password,
        ) : true; //TODO: If user doesn`t have password return true. User have access to update password

        if (!isMatch) {
            throw new UnauthorizedException('Old password does not match');
        }
        const hashedNewPassword = await this.passwordService.hash(
            String(dto.newPassword),
        );
        const result = await this.usersRepository.update(id, {
            password: hashedNewPassword,
        });
        if (!result) {
            throw new NotFoundException('User not found');
        }

        const transformedUser = await this.fileUrlTransformerService.transform(
            result,
            [FileUrlTransformerService.COMMON_CONFIGS.USER_AVATAR],
        );

        return plainToInstance(User, transformedUser, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async updateUserAvatar(
        id: number,
        avatar: Express.Multer.File,
    ): Promise<User> {
        const user = await this.findById(id);

        const fileDbDetails: UploadFileDto = {
            authorId: id,
            targetType: this.TARGET_TYPE,
            targetId: id,
        };

        const fileUploadResult = await this.fileUploadService.upload(avatar, fileDbDetails);

        const result = await this.usersRepository.update(id, {
            avatarFileId: fileUploadResult.fileId,
        });
        if (!result) {
            throw new NotFoundException('User not found');
        }

        if (user.avatarFile && !user.avatarFile.isDefault) {
            await this.filesService.softDelete(user.avatarFileId);
        }

        const transformedResult = await this.fileUrlTransformerService.transform(
            result,
            [FileUrlTransformerService.COMMON_CONFIGS.USER_AVATAR],
        );

        return plainToInstance(User, transformedResult, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async deleteUserAvatar(
        id: number,
        fileKey: string,
    ): Promise<User> {
        const user = await this.findByIdWithAvatar(id);

        let result: User = user;
        if (user.avatarFile && user.avatarFile.fileKey === fileKey) {
            result = await this.usersRepository.update(id, {
                avatarFileId: await this.getDefaultAvatarId(),
            }) as User;
        }

        await this.filesService.softDeleteByFileKey(fileKey);

        const transformedResult = await this.fileUrlTransformerService.transform(
            result as User,
            [FileUrlTransformerService.COMMON_CONFIGS.USER_AVATAR],
        );

        return plainToInstance(User, transformedResult, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async resetPassword(id: number, newPassword: string): Promise<User> {
        await this.findById(id);
        const hashedPassword = await this.passwordService.hash(newPassword);
        const updateData: Partial<User> = { password: hashedPassword };
        const result = await this.usersRepository.update(id, updateData);
        if (!result) {
            throw new NotFoundException('User not found');
        }

        const transformedResult = await this.fileUrlTransformerService.transform(
            result,
            [FileUrlTransformerService.COMMON_CONFIGS.USER_AVATAR],
        );

        return plainToInstance(User, transformedResult, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async confirmEmail(userId: number) {
        await this.findById(userId);
        const updateData: Partial<User> = { isEmailVerified: true };
        const result = await this.usersRepository.update(userId, updateData);

        const transformedResult = await this.fileUrlTransformerService.transform(
            result as User,
            [FileUrlTransformerService.COMMON_CONFIGS.USER_AVATAR],
        );

        return plainToInstance(User, transformedResult, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async delete(id: number): Promise<void> {
        const user = await this.findById(id);

        if (user.avatarFile && !user.avatarFile.isDefault) {
            await this.filesService.softDelete(user.avatarFileId);
        }

        const userFiles = await this.filesService.findAllByAuthorId(id);

        if (userFiles.length > 0) {
            await this.filesService.softDeleteMany(userFiles.map(file => file.id));
        }

        //TODO: Delete all user projects/fonts (not now)

        await this.usersRepository.delete(id);
    }
}








