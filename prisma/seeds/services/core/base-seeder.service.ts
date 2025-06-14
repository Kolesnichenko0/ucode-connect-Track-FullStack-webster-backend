// prisma/seeds/services/base-seeder.service.ts
import { DatabaseService } from '../../../../src/core/db/database.service';
import { FilesService } from '../../../../src/core/files/files.service';
import { FileRepository } from '../../../../src/core/files/files.repository';
import { FilePathsService } from '../../../../src/core/files/file-paths.service';
import { FileUrlTransformerService } from '../../../../src/core/files/file-url-transformer.service';
import { FileUploadService } from '../../../../src/core/file-upload/file-upload.service';
import { UsersService } from '../../../../src/core/users/users.service';
import { UsersRepository } from '../../../../src/core/users/users.repository';
import { HashingPasswordsService } from '../../../../src/core/users/hashing-passwords.service';
import { HashingService } from '../../../../src/core/hashing/hashing.service';
import { ApiConfigService } from '../../../../src/config/api-config.service';
import { ConfigService } from '@nestjs/config';
import { UnsplashService } from '../../../../src/core/unsplash/unsplash.service';
import storageConfig from '../../../../src/config/configs/storage.config';
import appConfig from '../../../../src/config/configs/app.config';
import assetsConfig from '../../../../src/config/configs/assets.config';
import unsplashConfig from '../../../../src/config/configs/unsplash.config';

export class BaseSeederService {
    private static instance: BaseSeederService;

    public readonly configService: ConfigService;
    public readonly apiConfigService: ApiConfigService;
    public readonly dbService: DatabaseService;
    public readonly filesService: FilesService;
    public readonly filePathsService: FilePathsService;
    public readonly fileUrlTransformerService: FileUrlTransformerService;
    public readonly fileUploadService: FileUploadService;
    public readonly usersService: UsersService;
    public readonly usersRepository: UsersRepository;
    public readonly unsplashService: UnsplashService;

    private constructor() {
        console.log('🔧 Initializing seeder services...');

        this.configService = new ConfigService({
            ...storageConfig(),
            ...appConfig(),
            ...assetsConfig(),
            ...unsplashConfig(),
        });
        this.apiConfigService = new ApiConfigService(this.configService);
        this.dbService = new DatabaseService();

        // Files services
        const fileRepository = new FileRepository(this.dbService);
        this.filePathsService = new FilePathsService(this.apiConfigService);
        this.filesService = new FilesService(fileRepository, this.filePathsService);
        this.fileUrlTransformerService = new FileUrlTransformerService(
            this.filePathsService,
            this.filesService
        );
        this.fileUploadService = new FileUploadService(
            this.filesService,
            this.filePathsService
        );

        // Users services
        const hashingService = new HashingService();
        const passwordService = new HashingPasswordsService(hashingService);
        this.usersRepository = new UsersRepository(this.dbService);
        this.usersService = new UsersService(
            this.usersRepository,
            passwordService,
            this.fileUploadService,
            this.filesService,
            this.fileUrlTransformerService
        );

        // Unsplash service
        this.unsplashService = new UnsplashService(this.apiConfigService);

        console.log('✅ Seeder services initialized');
    }

    public static getInstance(): BaseSeederService {
        if (!BaseSeederService.instance) {
            BaseSeederService.instance = new BaseSeederService();
        }
        return BaseSeederService.instance;
    }
}
