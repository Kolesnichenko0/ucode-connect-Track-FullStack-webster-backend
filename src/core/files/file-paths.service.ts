// src/core/files/file-paths.service.ts
import { Injectable } from '@nestjs/common';
import { FileTargetType } from '@prisma/client';
import { ApiConfigService } from 'src/config/api-config.service';
import { File } from './entities/file.entity';
import { buildFilePath, buildUrl } from '../../common/utils';

interface FileTypeConfig {
    storagePath: string;
    assetPath?: string;
    assetServerUrl?: string;
}

interface ConfigMapping {
    storagePathKey: string;
    assetPathKey?: string;
    assetUrlKey?: string;
}

@Injectable()
export class FilePathsService {
    private readonly configMapping: Record<FileTargetType, ConfigMapping> = {
        [FileTargetType.USER_AVATAR]: {
            storagePathKey: 'storage.paths.uploads.userAvatars',
            assetPathKey: 'assets.public.paths.userAvatars',
            assetUrlKey: 'assets.public.serverUrls.userAvatars',
        },
        [FileTargetType.PROJECT_ASSET]: {
            storagePathKey: 'storage.paths.uploads.projectAssets',
            assetPathKey: 'assets.public.paths.projects',
            assetUrlKey: 'assets.public.serverUrls.projects',
        },
        [FileTargetType.PROJECT_PREVIEW]: {
            storagePathKey: 'storage.paths.uploads.projectPreviews',
        },
        [FileTargetType.FONT_ASSET]: {
            storagePathKey: 'storage.paths.uploads.fontAssets',
        },
    };

    private fileConfigs: Record<FileTargetType, FileTypeConfig>;
    private storageFilesServerUrl: string;

    constructor(private readonly cs: ApiConfigService) {
        this.initializeConfig();
    }

    private initializeConfig() {
        const targetTypes = Object.keys(this.configMapping) as FileTargetType[];

        this.fileConfigs = {} as Record<FileTargetType, FileTypeConfig>;
        this.storageFilesServerUrl = this.cs.get('storage.filesServerUrl');

        targetTypes.forEach((targetType) => {
            const mapping = this.configMapping[targetType];

            this.fileConfigs[targetType] = {
                storagePath: this.cs.get(mapping.storagePathKey as any),

                assetPath: mapping.assetPathKey
                    ? this.cs.get(mapping.assetPathKey as any)
                    : undefined,
                assetServerUrl: mapping.assetUrlKey
                    ? this.cs.get(mapping.assetUrlKey as any)
                    : undefined,
            };
        });
    }

    getDirectoryPath(targetType: FileTargetType, isDefault: boolean = false): string {
        const config = this.fileConfigs[targetType];
        if (!config) {
            throw new Error(`Unsupported file target type: ${targetType}`);
        }

        if (isDefault) {
            if (!config.assetPath) {
                throw new Error(`No asset path configuration for file type: ${targetType}`);
            }
            return config.assetPath;
        }

        return config.storagePath;
    }

    getFilePath(file: File): string {
        const directoryPath = this.getDirectoryPath(file.targetType, file.isDefault);
        return buildFilePath(directoryPath, `${file.fileKey}.${file.extension}`);
    }

    getFileUrl(file: File): string {
        const config = this.fileConfigs[file.targetType];
        if (!config) {
            throw new Error(`Unsupported file target type for URL: ${file.targetType}`);
        }

        const filename = `${file.fileKey}.${file.extension}`;

        if (file.isDefault) {
            if (!config.assetServerUrl) {
                throw new Error(`No asset server URL configuration for file type: ${file.targetType}`);
            }
            return buildUrl(config.assetServerUrl, filename);
        } else {
            return buildUrl(this.storageFilesServerUrl, filename);
        }
    }

    isValidTargetType(targetType: FileTargetType): boolean {
        return targetType in this.fileConfigs;
    }

    isSupportedDefaultFiles(targetType: FileTargetType): boolean {
        const config = this.fileConfigs[targetType];
        return !!(config?.assetPath && config?.assetServerUrl);
    }

    getSupportedTargetTypes(): FileTargetType[] {
        return Object.keys(this.fileConfigs) as FileTargetType[];
    }

    getTargetTypesWithDefaultSupport(): FileTargetType[] {
        return this.getSupportedTargetTypes().filter(type => this.isSupportedDefaultFiles(type));
    }
}
