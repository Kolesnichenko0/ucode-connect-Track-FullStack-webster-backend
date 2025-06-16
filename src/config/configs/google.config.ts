// src/config/configs/google.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';
import getAppConfig from './app.config';
import { buildUrl } from '../../common/utils';

const appConfig = getAppConfig();

const GoogleSchema = z
    .object({
        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),
        GOOGLE_GMAIL_ENABLED: z
            .preprocess((val) => val !== 'false', z.boolean())
            .default(true),
        GOOGLE_GMAIL_SENDER_EMAIL: z.string().email().optional(),
        GOOGLE_SA_KEY_FOR_GMAIL: z.string().optional(),
        GOOGLE_GMAIL_API_REFRESH_TOKEN: z.string().optional(),
        GOOGLE_GMAIL_CLIENT_ID: z.string().optional(),
        GOOGLE_GMAIL_CLIENT_SECRET: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.GOOGLE_GMAIL_ENABLED) {
                return (
                    data.GOOGLE_GMAIL_SENDER_EMAIL !== undefined &&
                    (data.GOOGLE_SA_KEY_FOR_GMAIL !== undefined ||
                        (data.GOOGLE_GMAIL_API_REFRESH_TOKEN !== undefined &&
                            data.GOOGLE_GMAIL_CLIENT_ID !== undefined &&
                            data.GOOGLE_GMAIL_CLIENT_SECRET !== undefined))
                );
            }
            return true;
        },
        {
            message:
                'GOOGLE_GMAIL_SENDER_EMAIL and GOOGLE_SA_KEY_FOR_GMAIL or (GOOGLE_GMAIL_API_REFRESH_TOKEN, GOOGLE_GMAIL_CLIENT_ID, GOOGLE_GMAIL_CLIENT_SECRET) are required when GOOGLE_GMAIL_ENABLED is true',
            path: [
                'GOOGLE_GMAIL_SENDER_EMAIL',
                'GOOGLE_SA_KEY_FOR_GMAIL',
                'GOOGLE_GMAIL_API_REFRESH_TOKEN',
                'GOOGLE_GMAIL_CLIENT_ID',
                'GOOGLE_GMAIL_CLIENT_SECRET',
            ],
        },
    );

export type IGoogleConfig = ReturnType<typeof getGoogleConfig>;

const getGoogleConfig = () => {
    const config = ConfigValidator.validate(
        process.env,
        GoogleSchema,
    ) as z.infer<typeof GoogleSchema>;
    const callbackUrl = buildUrl(appConfig.app.serverUrl, appConfig.app.globalPrefix, '/auth/google/callback');

    return {
        google: {
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackUrl: callbackUrl,
            gmail: {
                enabled: config.GOOGLE_GMAIL_ENABLED,
                useServiceAccount: config.GOOGLE_SA_KEY_FOR_GMAIL !== undefined,
                senderEmail: config.GOOGLE_GMAIL_SENDER_EMAIL || '',

                serviceAccountKey: config.GOOGLE_SA_KEY_FOR_GMAIL || '',

                refreshToken: config.GOOGLE_GMAIL_API_REFRESH_TOKEN || '',
                clientId: config.GOOGLE_GMAIL_CLIENT_ID || '',
                clientSecret: config.GOOGLE_GMAIL_CLIENT_SECRET || '',
            },
        },
    };
};

export default getGoogleConfig;
