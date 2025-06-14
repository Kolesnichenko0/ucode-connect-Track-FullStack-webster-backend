// prisma/seeds/constants/seed.constants.ts
import { UnsplashOrientation } from '../../../src/core/unsplash/interfaces/unsplash.interfaces';

export const SEED_CONSTANTS = {
    PRODUCT: {
        DOMAIN: 'gmail.com',
    },
    USERS: {
        TOTAL: 10,
        PASSWORD: 'Password123!$',
        GENDER_PROBABILITY: 0.5,
        AVATAR_PROBABILITY: 0.7,
        TEST_USER: {
            FIRST_NAME: 'Test',
            LAST_NAME: 'User',
            EMAIL_PREFIX: 'test.user',
        },
    },
    USER_AVATAR_SERVICE: {
        BASE_URL: 'https://avatar.iran.liara.run/public',
        ENDPOINTS: {
            BOY: 'boy',
            GIRL: 'girl',
        },
        FORMAT: 'png' as const,
    },
    UNSPLASH: {
        MAX_PER_PAGE: 30,
        PROJECT_BACKGROUNDS: {
            COUNT_PER_QUERY: 2, // Number of photos for each query. MAX is 30.
            WIDTH: 1920,
            HEIGHT: 1080,
            ORIENTATION: UnsplashOrientation.LANDSCAPE as const,
            CONTENT_FILTER: 'high' as const,
            FORMAT: 'jpg' as const,
            CATEGORIES: [
                {
                    name: 'nature',
                    queries: ['beautiful landscape', 'nature photography', 'mountains forest'],
                },
                {
                    name: 'architecture',
                    queries: ['modern architecture', 'building interior', 'minimal design'],
                },
                {
                    name: 'business',
                    queries: ['modern office', 'workspace design', 'technology'],
                },
                {
                    name: 'abstract',
                    queries: ['geometric pattern', 'abstract design', 'minimal gradient'],
                },
                {
                    name: 'texture',
                    queries: ['clean texture', 'material surface', 'background pattern'],
                },
            ],
        },
    },
    FILES: {
        DEFAULT_USER_AVATAR_ASSET: {
            FILENAME: 'default-user-avatar.png',
        },
        DEFAULT_PROJECT_ASSET: {
            FILENAME: 'default-project-asset.jpg',
        },
        DEFAULT_PROJECT_PREVIEW: {
            FILENAME: 'default-project-preview.jpg',
        },
        DEFAULT_PROJECT_ELEMENT_MIN_COUNT: 20,
    },
} as const;
