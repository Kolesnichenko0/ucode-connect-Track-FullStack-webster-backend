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
    PROJECTS: {
        TEMPLATES: {
            COUNT: 4,
            AVAILABLE_FILTERS: ['Grayscale', 'Blur', 'Pixelate', 'Contrast', 'Brighten', 'Noise'],
            TYPES: [
                {
                    type: 'instagram-post',
                    title: 'Instagram Post Template',
                    description: 'Modern Instagram post design with beautiful background',
                    width: 1080,
                    height: 1080,
                },
                {
                    type: 'instagram-story',
                    title: 'Instagram Story Template',
                    description: 'Engaging Instagram story layout',
                    width: 1080,
                    height: 1920,
                },
                {
                    type: 'facebook-post',
                    title: 'Facebook Post Template',
                    description: 'Professional Facebook post design',
                    width: 1200,
                    height: 630,
                },
                {
                    type: 'poster',
                    title: 'Event Poster Template',
                    description: 'Eye-catching event poster design',
                    width: 1080,
                    height: 1350,
                },
            ] as const,
        },
        USER_PROJECTS: {
            DEFAULT_PREVIEW: 'default-project-preview',
            MIN_COUNT_PER_USER: 8,
            MAX_COUNT_PER_USER: 12,
            TITLE_PREFIXES: [
                'My Design',
                'Creative Project',
                'Brand Design',
                'Social Media',
                'Marketing Campaign',
                'Visual Content',
                'Digital Art',
                'Presentation',
            ] as const,
            TITLE_SUFFIXES: [
                'Concept',
                'Draft',
                'Final',
                'Version',
                'Design',
                'Layout',
                'Template',
                'Mockup',
            ] as const,
        },
    },
} as const;
