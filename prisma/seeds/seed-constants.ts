// prisma/seeds/seed-constants.ts
export const SEEDS = {
    PRODUCT: {
        DOMAIN: 'gmail.com',
    },
    USERS: {
        TOTAL: 30,
        PASSWORD: 'Password123!$',
        GENDER_PROBABILITY: 0.5,
        DEFAULT_AVATAR_PICTURE: 'default-avatar.png',
        AVATAR_MASK: 'user-avatar-*.png',
        AVATAR_COUNT: 30,
        GENERATE_AVATARS: false,
    },
} as const;
