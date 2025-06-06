// src/config/configs/unsplash.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';

const UnsplashSchema = z.object({
    UNSPLASH_ACCESS_KEY: z.string(),
});

export type IUnsplashConfig = ReturnType<typeof getUnsplashConfig>;

const getUnsplashConfig = () => {
    const config = ConfigValidator.validate(
        process.env,
        UnsplashSchema,
    ) as z.infer<typeof UnsplashSchema>;

    return {
        unsplash: {
            accessKey: config.UNSPLASH_ACCESS_KEY,
        },
    };
};

export default getUnsplashConfig;
