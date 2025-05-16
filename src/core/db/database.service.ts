// src/core/db/database.service.ts
import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);

    constructor() {
        super();
    }

    async onModuleInit() {
        this.logger.log('Connecting to database...');
        await this.$connect();
        this.logger.log('Database connection established');
    }

    async onModuleDestroy() {
        this.logger.log('Disconnecting from database...');
        await this.$disconnect();
        this.logger.log('Database connection closed');
    }
}
