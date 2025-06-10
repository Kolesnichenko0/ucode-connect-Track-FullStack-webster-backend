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
    ASSETS_DEFAULT_PROJECT_ASSET_KEY: z.string().default('default-project-asset'),
    ASSETS_DEFAULT_PROJECT_PREVIEW_KEY: z.string().default('default-project-preview'),
});

export type IAssetsConfig = ReturnType<typeof getAssetsConfig>;

const BASE_IMAGES_PATH = 'images';
const BASE_PROJECT_PATH = `${BASE_IMAGES_PATH}/project`;
const ASSET_CATEGORIES = {
    projectBackgrounds: `${BASE_PROJECT_PATH}/backgrounds`,
    projectPreviews: `${BASE_PROJECT_PATH}/previews`,
    projectElements: `${BASE_PROJECT_PATH}/elements`,
    projectAssets: `${BASE_PROJECT_PATH}/photos`,
    logos: `${BASE_IMAGES_PATH}/logos`,
    userAvatars: `${BASE_IMAGES_PATH}/user-avatars`,
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
            defaultKeys: {
                projectAsset: config.ASSETS_DEFAULT_PROJECT_ASSET_KEY,
                projectPreview: config.ASSETS_DEFAULT_PROJECT_PREVIEW_KEY,
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
