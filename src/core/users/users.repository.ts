// src/core/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { DatabaseService } from '../db/database.service';
import { GetUsersDto } from './dto/get-users.dto';

@Injectable()
export class UsersRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(data: Partial<User>): Promise<User> {
        return this.db.user.create({
            data: data as any,
        });
    }

    async findAllUnactivatedByCreatedAt(createdBefore: Date): Promise<User[]> {
        return this.db.user.findMany({
            where: {
                createdAt: { lt: createdBefore },
                isEmailVerified: false,
            },
            orderBy: { createdAt: 'desc' },
        });
    }


    async findAll(getUsersDto: GetUsersDto): Promise<User[]> {
        const whereOptions: Record<string, unknown> = {};
        if (getUsersDto.email) {
            whereOptions.email = getUsersDto.email;
        }
        return this.db.user.findMany({
            where: whereOptions,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: number): Promise<User | null> {
        return this.db.user.findUnique({
            where: { id },
            include: { refreshTokenNonces: true, avatarFile: true },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.db.user.findUnique({
            where: { email },
            include: { refreshTokenNonces: true, avatarFile: true },
        });
    }

    async update(
        id: number,
        updateData: Partial<User>,
    ): Promise<User | null> {
        return this.db.user.update({
            where: { id },
            data: updateData as any,
        });
    }

    async delete(id: number): Promise<void> {
        await this.db.user.delete({
            where: { id },
        });
    }
}
