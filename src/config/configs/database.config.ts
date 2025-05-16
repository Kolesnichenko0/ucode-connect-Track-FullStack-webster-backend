// src/config/configs/database.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';

const DatabaseSchema = z.object({
  DB_APP_HOST: z.string(),
  DB_APP_PORT: z.coerce.number(),
  DB_APP_USER: z.string(),
  DB_APP_PASSWORD: z.string(),
  DB_APP_DATABASE: z.string(),
  DB_APP_URL: z.string(),
  DB_APP_CONNECTION_LIMIT: z.coerce.number().default(10),
  SHADOW_DB_APP_DATABASE: z.string(),
  SHADOW_DB_APP_URL: z.string(),
});

export type IDatabaseConfig = ReturnType<typeof getDatabaseConfig>;

const getDatabaseConfig = () => {
  const config = ConfigValidator.validate(process.env, DatabaseSchema) as z.infer<typeof DatabaseSchema>;

  return {
    database: {
      app: {
        host: config.DB_APP_HOST,
        port: config.DB_APP_PORT,
        username: config.DB_APP_USER,
        password: config.DB_APP_PASSWORD,
        name: config.DB_APP_DATABASE,
        url: config.DB_APP_URL,
        connectionLimit: config.DB_APP_CONNECTION_LIMIT,
      },
      shadow: {
        name: config.SHADOW_DB_APP_DATABASE,
        url: config.SHADOW_DB_APP_URL,
      },
    },
  };
};

export default getDatabaseConfig;
