// src/config/configs/storage.config.ts
import * as path from 'path';
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';
import getAppConfig from './app.config';
import { FileTargetType } from '@prisma/client';
import { joinPath, normalizePath } from '../../common/utils';

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

export const UPLOAD_CATEGORY_TO_TARGET_TYPE: Record<string, FileTargetType> = {
    [STORAGE_UPLOAD_CATEGORIES.userAvatars]: FileTargetType.USER_AVATAR,
    [STORAGE_UPLOAD_CATEGORIES.projectAssets]: FileTargetType.PROJECT_ASSET,
    [STORAGE_UPLOAD_CATEGORIES.projectPreviews]: FileTargetType.PROJECT_PREVIEW,
    [STORAGE_UPLOAD_CATEGORIES.fontAssets]: FileTargetType.FONT_ASSET,
};

export const TARGET_TYPE_TO_UPLOAD_CATEGORY: Record<FileTargetType, string> = {
    [FileTargetType.USER_AVATAR]: STORAGE_UPLOAD_CATEGORIES.userAvatars,
    [FileTargetType.PROJECT_ASSET]: STORAGE_UPLOAD_CATEGORIES.projectAssets,
    [FileTargetType.PROJECT_PREVIEW]: STORAGE_UPLOAD_CATEGORIES.projectPreviews,
    [FileTargetType.FONT_ASSET]: STORAGE_UPLOAD_CATEGORIES.fontAssets,
};

const getStorageConfig = () => {
    const config = ConfigValidator.validate(
        process.env,
        StorageSchema,
    ) as z.infer<typeof StorageSchema>;

    const baseStoragePath = normalizePath(config.STORAGE_BASE_PATH);
    const baseUploadsLocalPath = joinPath('/', baseStoragePath, 'uploads');

    const categoryLocalPaths: {
        [K in keyof typeof STORAGE_UPLOAD_CATEGORIES]: string;
    } = {} as any;

    for (const key in STORAGE_UPLOAD_CATEGORIES) {
        const categoryKey = key as keyof typeof STORAGE_UPLOAD_CATEGORIES;
        const relativePath = STORAGE_UPLOAD_CATEGORIES[categoryKey];
        categoryLocalPaths[categoryKey] = joinPath(
            '/',
            baseUploadsLocalPath,
            relativePath,
        );
    }

    let tempServerUrl = appConfig.app.serverUrl;
    if (tempServerUrl.endsWith('/')) {
        tempServerUrl = tempServerUrl.slice(0, -1);
    }

    const urlPathSegments: string[] = [];
    if (appConfig.app.globalPrefix && appConfig.app.globalPrefix !== '/') {
        let prefix = appConfig.app.globalPrefix;
        if (prefix.startsWith('/')) prefix = prefix.substring(1);
        if (prefix.endsWith('/')) prefix = prefix.slice(0, -1);
        if (prefix) urlPathSegments.push(prefix);
    }
    urlPathSegments.push('files');

    const filesServerUrl = `${tempServerUrl}/${urlPathSegments.join('/')}`;

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
