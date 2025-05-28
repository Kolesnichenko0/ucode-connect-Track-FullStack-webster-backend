// setup/config/database.root.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../../src/config/config.validator';

const DatabaseRootSchema = z.object({
  DB_ROOT_HOST: z.string(),
  DB_ROOT_PORT: z.coerce.number(),
  DB_ROOT_USER: z.string(),
  DB_ROOT_PASSWORD: z.string(),
});

export type IDatabaseRootConfig = ReturnType<typeof getDatabaseRootConfig>;

const getDatabaseRootConfig = () => {
  const config = ConfigValidator.validate(process.env, DatabaseRootSchema) as z.infer<typeof DatabaseRootSchema>;

  return {
    host: config.DB_ROOT_HOST,
    port: config.DB_ROOT_PORT,
    user: config.DB_ROOT_USER,
    password: config.DB_ROOT_PASSWORD,
  };
};

export default getDatabaseRootConfig;
