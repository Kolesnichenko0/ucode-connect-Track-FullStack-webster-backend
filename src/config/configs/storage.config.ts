// src/config/configs/storage.config.ts
import * as path from 'path';
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';

const StorageSchema = z.object({
  STORAGE_BASE_PATH: z.string().default('storage'),
});

export type IStorageConfig = ReturnType<typeof getStorageConfig>;

const getStorageConfig = () => {
  const config = ConfigValidator.validate(process.env, StorageSchema) as z.infer<typeof StorageSchema>;
  const baseStoragePath = config.STORAGE_BASE_PATH;
  const baseUploadsPath = path.join(baseStoragePath, 'uploads');

  return {
    storage: {
      paths: {
        base: baseStoragePath,
        baseUploads: baseUploadsPath,
        // uploads: {
        //   avatars: path.join(baseUploadsPath, 'avatars'),
        // }
      }
    },
  };
};

export default getStorageConfig;
