// src/config/configs/assets.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';
import getAppConfig from './app.config';
import { buildFilePath, normalizeFilePath, buildUrl } from '../../common/utils';

const appConfig = getAppConfig();

const AssetsSchema = z.object({
    ASSETS_PUBLIC_PATH: z.string().default('public'),
    ASSETS_BASE_PATH: z.string().default('assets'),
    ASSETS_LOGO_FILENAME: z.string().default('logo.png'),
});

export type IAssetsConfig = ReturnType<typeof getAssetsConfig>;

const ASSET_CATEGORIES = {
    projects: 'images/project-photos',
    projectPreviews: 'images/project-previews',
    logos: 'images/logos',
    userAvatars: 'images/user-avatars',
};

const getAssetsConfig = () => {
    const config = ConfigValidator.validate(
        process.env,
        AssetsSchema,
    ) as z.infer<typeof AssetsSchema>;

    const serverUrl = appConfig.app.serverUrl;

    const baseAssetsPath = normalizeFilePath(config.ASSETS_BASE_PATH);
    const basePublicAssetsPath = buildFilePath(
        normalizeFilePath(config.ASSETS_PUBLIC_PATH),
        baseAssetsPath,
    )
    const baseAssetsServerUrl = buildUrl(serverUrl, baseAssetsPath);

    const publicAssetsPaths: { [K in keyof typeof ASSET_CATEGORIES]: string } =
        {} as any;
    const assetsServerUrls: {
        [K in keyof typeof ASSET_CATEGORIES]: string;
    } = {} as any;

    for (const key in ASSET_CATEGORIES) {
        const categoryKey = key as keyof typeof ASSET_CATEGORIES;
        const relativePath = normalizeFilePath(ASSET_CATEGORIES[categoryKey]);

        publicAssetsPaths[categoryKey] = buildFilePath(
            basePublicAssetsPath,
            relativePath,
        );

        assetsServerUrls[categoryKey] = buildUrl(
            baseAssetsServerUrl,
            relativePath,
        );
    }

    return {
        assets: {
            publicPath: config.ASSETS_PUBLIC_PATH,
            filenames: {
                logo: config.ASSETS_LOGO_FILENAME,
            },
            paths: {
                base: basePublicAssetsPath,
                ...publicAssetsPaths,
            },
            serverUrls: {
                base: baseAssetsServerUrl,
                ...assetsServerUrls,
            },
        },
    };
};

export default getAssetsConfig;
