// src/config/configs/assets.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';
import getAppConfig from './app.config';
import { buildFilePath, normalizeFilePath, buildUrl } from '../../common/utils';

const appConfig = getAppConfig();

const AssetsSchema = z.object({
    ASSETS_BASE_PUBLIC_PATH: z.string().default('./public/assets'),
    ASSETS_LOGO_FILENAME: z.string().default('logo.png'),
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

    const basePublicAssetsPath = normalizeFilePath(config.ASSETS_BASE_PUBLIC_PATH);
    const basePublicAssetsServerUrl = buildUrl(serverUrl, basePublicAssetsPath);

    const publicAssetsPaths: { [K in keyof typeof ASSET_CATEGORIES]: string } = {} as any;
    const publicAssetsServerUrls: { [K in keyof typeof ASSET_CATEGORIES]: string } = {} as any;

    for (const key in ASSET_CATEGORIES) {
        const categoryKey = key as keyof typeof ASSET_CATEGORIES;
        const relativePath = normalizeFilePath(ASSET_CATEGORIES[categoryKey]);

        publicAssetsPaths[categoryKey] = buildFilePath(
            basePublicAssetsPath,
            relativePath
        );

        publicAssetsServerUrls[categoryKey] = buildUrl(basePublicAssetsServerUrl, relativePath);
    }

    return {
        assets: {
            filenames: {
                logo: config.ASSETS_LOGO_FILENAME,
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
