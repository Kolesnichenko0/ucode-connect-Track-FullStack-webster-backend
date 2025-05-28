// src/core/users/users.service.ts
import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SERIALIZATION_GROUPS, User } from './entities/user.entity';
import { HashingPasswordsService } from './hashing-passwords.service';
import { plainToInstance } from 'class-transformer';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { FileTargetType } from '@prisma/client';
import { UploadFileDto } from '../file-upload/dto/upload-file.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import { FilesService } from '../files/files.service';
import { FilePathService } from '../files/file-path.utils';

@Injectable()
export class UsersService {

    private readonly TARGET_TYPE = FileTargetType.USER_AVATAR;

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly passwordService: HashingPasswordsService,
        private readonly fileUploadService: FileUploadService,
        private readonly filesService: FilesService,
        private readonly filePathService: FilePathService
    ) { }

    async create(dto: CreateUserDto): Promise<User> {
        const existing = await this.usersRepository.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already in use');
        }
        dto.password = await this.passwordService.hash(dto.password);
        const result = await this.usersRepository.create(dto);

        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async findAllUnactivated(time: number): Promise<User[]> {
        const users = await this.usersRepository.findAllUnactivated(time);
        return users.map((user) =>
            plainToInstance(User, user, {
                groups: SERIALIZATION_GROUPS.PRIVATE,
            }),
        );
    }

    async findAll(getUsersDto: GetUsersDto): Promise<User[]> {
        const users = await this.usersRepository.findAll(getUsersDto);
        return users.map((user) =>
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
        return plainToInstance(User, user, {
            groups: serializationGroup,
        });
    }

    async findByIdWithoutPassword(id: number): Promise<User> {
        return this.findById(id, SERIALIZATION_GROUPS.BASIC);
    }

    async findByIdWithConfidential(id: number): Promise<User> {
        const user: User = await this.findById(id, SERIALIZATION_GROUPS.CONFIDENTIAL)

        const fileAvatar = await this.filesService.findById(user.avatarFileId);

        user.avatarURL = this.filePathService.getFileUrl(fileAvatar)

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const result = await this.usersRepository.findByEmail(email);
        if (!result) {
            throw new NotFoundException('User with this email not found');
        }
        return plainToInstance(User, result, {
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
        const result = await this.usersRepository.update(id, dto);
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async updatePassword(
        id: number,
        dto: UpdateUserPasswordDto,
    ): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User with this id not found');
        }

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
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async updateUserAvatar(
        id: number,
        avatar: Express.Multer.File,
    ): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User with this email not found');
        }

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

        const oldAvatar = await this.filesService.findById(user.avatarFileId);

        if (!oldAvatar.isDefault) {
            await this.filesService.softDelete(user.avatarFileId);
        }

        const userInstance: User = plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });

        userInstance.avatarURL = fileUploadResult.url;

        return userInstance;
    }

    async resetPassword(id: number, newPassword: string): Promise<User> {
        const hashedPassword = await this.passwordService.hash(newPassword);
        const updateData: Partial<User> = { password: hashedPassword };
        const result = await this.usersRepository.update(id, updateData);
        if (!result) {
            throw new NotFoundException('User not found');
        }
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async confirmEmail(userId: number) {
        const updateData: Partial<User> = { isEmailVerified: true };
        const result = await this.usersRepository.update(userId, updateData);
        return plainToInstance(User, result, {
            groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
        });
    }

    async delete(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }
}
