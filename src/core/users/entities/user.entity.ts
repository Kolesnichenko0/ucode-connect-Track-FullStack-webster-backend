// src/core/users/entities/user.entity.ts
import {
    User as PrismaUser,
    RefreshTokenNonce as PrismaRefreshTokenNonce,
} from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';

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

    @Expose({ groups: ['basic'] })
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

    @Expose({ groups: ['basic'] })//TODO: Тут нужно может трансформом задавать url?!
    avatarURL?: string;
}

export class UserWithBasic extends PickType(User, [
    'id',
    'firstName',
    'lastName',
    'email',
    'avatarFileId',
    'createdAt'
] as const) { }
