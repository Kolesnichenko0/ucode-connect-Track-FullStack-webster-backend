// src/config/configs/assets.config.ts
import * as path from 'path';
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';
import getAppConfig from './app.config';
import { joinPath, normalizePath } from '../../common/utils';

const appConfig = getAppConfig();

const AssetsSchema = z.object({
    ASSETS_BASE_PUBLIC_PATH: z.string().default('./public/assets'),
    ASSETS_LOGO_FILENAME: z.string().default('logo.png'),
    // ASSETS_DEFAULT_AVATAR_FILENAME: z.string().default('default-avatar.png'),
});

export type IAssetsConfig = ReturnType<typeof getAssetsConfig>;

const ASSET_CATEGORIES = {
    projects: 'images/projects',
    logos: 'images/logos',
    userAvatars: 'images/user-avatars',
};

const getAssetsConfig = () => {
    const config = ConfigValidator.validate(process.env, AssetsSchema) as z.infer<typeof AssetsSchema>;

    const serverUrl = appConfig.app.serverUrl;

    const basePublicAssetsPath = normalizePath(config.ASSETS_BASE_PUBLIC_PATH);
    const basePublicAssetsServerUrl = `${serverUrl}/${
        basePublicAssetsPath.startsWith('./')
            ? basePublicAssetsPath.substring(2)
            : basePublicAssetsPath
    }`;

    const publicAssetsPaths: { [K in keyof typeof ASSET_CATEGORIES]: string } = {} as any;
    const publicAssetsServerUrls: { [K in keyof typeof ASSET_CATEGORIES]: string } = {} as any;

    for (const key in ASSET_CATEGORIES) {
        const categoryKey = key as keyof typeof ASSET_CATEGORIES;
        const relativePath = ASSET_CATEGORIES[categoryKey];

        publicAssetsPaths[categoryKey] = joinPath(
            '/',
            basePublicAssetsPath,
            relativePath,
        );

        publicAssetsServerUrls[categoryKey] = `${basePublicAssetsServerUrl}/${relativePath}`;
    }

    return {
        assets: {
            filenames: {
                logo: config.ASSETS_LOGO_FILENAME,
                // defaultAvatar: config.ASSETS_DEFAULT_AVATAR_FILENAME,
            },

            public: {
                paths: {
                    base: basePublicAssetsPath,
                    ...publicAssetsPaths,
                },
                serverUrls: {
                    base: basePublicAssetsServerUrl,
                    ...publicAssetsServerUrls,
                },
            },
        },
    };
};

export default getAssetsConfig;
