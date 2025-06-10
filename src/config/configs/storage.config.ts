// src/config/configs/storage.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';
import getAppConfig from './app.config';
import { buildFilePath, buildUrl, normalizeFilePath } from '../../common/utils';

const appConfig = getAppConfig();

const StorageSchema = z.object({
    STORAGE_BASE_PATH: z.string().default('storage'),
});

export type IStorageConfig = ReturnType<typeof getStorageConfig>;

export const STORAGE_UPLOAD_CATEGORIES = {
    userAvatars: 'user-avatars',
    projectAssets: 'project-assets',
    projectPreviews: 'project-previews',
    fontAssets: 'font-assets',
};

const getStorageConfig = () => {
    const config = ConfigValidator.validate(
        process.env,
        StorageSchema,
    ) as z.infer<typeof StorageSchema>;

    const baseStoragePath = normalizeFilePath(config.STORAGE_BASE_PATH);
    const baseUploadsLocalPath = buildFilePath(baseStoragePath, 'uploads');

    const categoryLocalPaths: {
        [K in keyof typeof STORAGE_UPLOAD_CATEGORIES]: string;
    } = {} as any;

    for (const key in STORAGE_UPLOAD_CATEGORIES) {
        const categoryKey = key as keyof typeof STORAGE_UPLOAD_CATEGORIES;
        const relativePath = normalizeFilePath(STORAGE_UPLOAD_CATEGORIES[categoryKey]);
        categoryLocalPaths[categoryKey] = buildFilePath(baseUploadsLocalPath, relativePath);
    }

    const urlPathSegments: string[] = [];
    const prefix = appConfig.app.globalPrefix;
    if (prefix && prefix !== '/') {
        urlPathSegments.push(prefix);
    }
    urlPathSegments.push('files');

    const filesServerUrl = buildUrl(appConfig.app.serverUrl, ...urlPathSegments)

    return {
        storage: {
            paths: {
                base: baseStoragePath,
                uploads: {
                    base: baseUploadsLocalPath,
                    ...categoryLocalPaths,
                },
            },
            filesServerUrl: filesServerUrl,
        },
    };
};

export default getStorageConfig;
