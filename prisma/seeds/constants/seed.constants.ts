// prisma/seeds/constants/seed.constants.ts
export const SEED_CONSTANTS = {
    PRODUCT: {
        DOMAIN: 'gmail.com',
    },
    USERS: {
        TOTAL: 5,
        PASSWORD: 'Password123!$',
        GENDER_PROBABILITY: 0.5,
        TEST_USER: {
            FIRST_NAME: 'Test',
            LAST_NAME: 'User',
            EMAIL_PREFIX: 'test.user',
        },
    },
    FILES: {
        DEFAULT_USER_AVATAR_ASSET: {
            FILENAME: 'default-avatar.png',
        },
        USER_AVATARS_UPLOADS_UNSPLASH: {
            SIZE: 400,
            ORIENTATION: 'squarish' as const,
        },
        DEFAULT_PROJECT_ASSET: {
            FILENAME: 'default-project-asset.jpg',
        },
        DEFAULT_PROJECT_ASSETS_UNSPLASH: {
            COUNT: 5,
            WIDTH: 1920,
            HEIGHT: 1080,
            ORIENTATION: 'landscape' as const,
            CATEGORIES: [
                { name: 'nature', keywords: ['landscape', 'forest', 'mountains', 'ocean'] },
                { name: 'architecture', keywords: ['building', 'modern', 'interior', 'minimal'] },
                { name: 'business', keywords: ['office', 'workspace', 'technology', 'professional'] },
                { name: 'abstract', keywords: ['geometric', 'pattern', 'gradient', 'minimal'] },
                { name: 'texture', keywords: ['material', 'surface', 'background', 'clean'] },
            ],
        },
        DEFAULT_PROJECT_PREVIEW: {
            FILENAME: 'default-project-preview.jpg',
        },
    },
} as const;

export type ProjectAssetCategory = typeof SEED_CONSTANTS.FILES.DEFAULT_PROJECT_ASSETS_UNSPLASH.CATEGORIES[number];
