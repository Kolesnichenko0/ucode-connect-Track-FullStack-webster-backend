// src/config/configs/google.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';
import getAppConfig from './app.config';
const appConfig = getAppConfig(); 

const GoogleSchema = z.object({
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_USE_GMAIL: z.preprocess((val) => val === 'true', z.boolean()).default(true),
    GOOGLE_GMAIL_API_REFRESH_TOKEN: z.string().optional(),
    GOOGLE_GMAIL_USER: z.string().email().optional(),
  }).refine(data => {
    if (data.GOOGLE_USE_GMAIL) {
      return data.GOOGLE_GMAIL_USER !== undefined && data.GOOGLE_GMAIL_API_REFRESH_TOKEN !== undefined;
    }
    return true;
  }, {
    message: "GOOGLE_GMAIL_USER and GOOGLE_GMAIL_API_REFRESH_TOKEN are required when GOOGLE_USE_GMAIL is true",
    path: ["GOOGLE_GMAIL_USER", "GOOGLE_GMAIL_API_REFRESH_TOKEN"],
  });

export type IGoogleConfig = ReturnType<typeof getGoogleConfig>;

const getGoogleConfig = () => {
  const config = ConfigValidator.validate(process.env, GoogleSchema) as z.infer<typeof GoogleSchema>;
  return {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      useGmail: config.GOOGLE_USE_GMAIL,
      gmailApi: {
        user: config.GOOGLE_GMAIL_USER || '',
        refreshToken: config.GOOGLE_GMAIL_API_REFRESH_TOKEN || '',
      },
      redirectUri: appConfig.app.serverUrl,
    },
  };
};

export default getGoogleConfig;
