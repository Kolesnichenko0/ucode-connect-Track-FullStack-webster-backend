// src/config/configs/jwt.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';

const JwtSchema = z.object({
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_CONFIRM_EMAIL_SECRET: z.string(),
  JWT_RESET_PASSWORD_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_CONFIRM_EMAIL_EXPIRES_IN: z.string().default('24h'),
  JWT_RESET_PASSWORD_EXPIRES_IN: z.string().default('1h'),
  JWT_ISSUER: z.string().default('/api/auth'),
  JWT_AUDIENCE: z.string().default('/api'),
  JWT_ALGORITHM: z.string().default('HS256'),
});

export type IJwtConfig = ReturnType<typeof getJwtConfig>;

const getJwtConfig = () => {
  const config = ConfigValidator.validate(process.env, JwtSchema) as z.infer<typeof JwtSchema>;

  return {
    jwt: {
      secrets: {
        access: config.JWT_ACCESS_SECRET,
        refresh: config.JWT_REFRESH_SECRET,
        confirmEmail: config.JWT_CONFIRM_EMAIL_SECRET,
        resetPassword: config.JWT_RESET_PASSWORD_SECRET,
      },
      expiresIn: {
        access: config.JWT_ACCESS_EXPIRES_IN,
        refresh: config.JWT_REFRESH_EXPIRES_IN,
        confirmEmail: config.JWT_CONFIRM_EMAIL_EXPIRES_IN,
        resetPassword: config.JWT_RESET_PASSWORD_EXPIRES_IN,
      },
      issuer: {
        auth: config.JWT_ISSUER,
      },
      audience: {
        auth: config.JWT_AUDIENCE,
      },
      algorithm: config.JWT_ALGORITHM,
    },
  };
};

export default getJwtConfig;
