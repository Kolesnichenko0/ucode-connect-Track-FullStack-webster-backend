// src/core/users/entities/user.entity.ts
import {
    User as PrismaUser,
    RefreshTokenNonce as PrismaRefreshTokenNonce,
    File as PrismaFile,
    FileTargetType,
} from '@prisma/client';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { FilePathsService } from '../../files/file-paths.service';
import { File } from 'src/core/files/entities/file.entity';
import { FilesService } from '../../files/files.service';

let filePathsServiceInstance: FilePathsService;
let filesServiceInstance: any;

export const setFilePathsService = (service: FilePathsService) => {
    filePathsServiceInstance = service;
};

export const setFilesService = (service: FilesService) => {
    filesServiceInstance = service;
}

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    CONFIDENTIAL: ['basic', 'confidential'],
    PRIVATE: ['basic', 'confidential', 'private'],
};

export class User implements PrismaUser {
    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'User identifier',
        nullable: false,
        type: 'number',
        example: 1,
    })
    id: number;

    @Expose({ groups: ['private'] })
    password: string | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'First name',
        nullable: false,
        type: 'string',
        example: 'Ann',
    })
    firstName: string;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Last name',
        nullable: true,
        type: 'string',
        example: 'Nichols',
    })
    lastName: string | null;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'User email',
        nullable: false,
        type: 'string',
        example: 'ann.nichols@gmail.com',
    })
    email: string;

    @Expose({ groups: ['private'] })
    @ApiProperty({
        description: 'Profile file ID',
        nullable: false,
        type: 'number',
        example: 1,
    })
    avatarFileId: number;

    @Expose({ groups: ['private'] })
    isEmailVerified: boolean;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'Creation date',
        nullable: false,
        type: 'string',
        example: '2025-04-08T05:54:45.000Z',
    })
    createdAt: Date;

    @Expose({ groups: ['private'] })
    updatedAt: Date;

    @Expose({ groups: ['private'] })
    refreshTokenNonces?: PrismaRefreshTokenNonce[];

    @Expose({ groups: ['private'] })
    avatarFile?: PrismaFile;

    @Expose({ groups: ['basic'] })
    @ApiProperty({
        description: 'URL of user avatar',
        nullable: true,
        type: 'string',
        example: 'https://example.com/assets/user-avatars/abc123.jpg',
    })
    @Transform(({ obj }) => {
        try {
            if (!filePathsServiceInstance || !obj.avatarFileId) {
                throw new Error('FilePathsService instance is not set');
            }

            let avatarFile: File;
            if (obj.avatarFile) {
                avatarFile = obj.avatarFile;
            } else {
                if (!filesServiceInstance) {
                    throw new Error('FilesService instance is not set');
                }
                avatarFile = filesServiceInstance.findById(obj.avatarFileId);
            }

            return filePathsServiceInstance.getFileUrl(avatarFile);
        } catch (error) {
            console.error('Error generating avatar URL:', error);
            return undefined;
        }
    })
    avatarFileURL?: string;
}

export class UserWithBasic extends PickType(User, [
    'id',
    'firstName',
    'lastName',
    'email',
    'avatarFileId',
    'avatarFileURL',
    'createdAt',
] as const) {}
