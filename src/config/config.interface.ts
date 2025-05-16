// src/config/config.interface.ts
import { IAppConfig } from './configs/app.config';
import { IJwtConfig } from './configs/jwt.config';
import { IDatabaseConfig } from './configs/database.config';
import { IEtherealConfig } from './configs/ethereal.config';
import { IGoogleConfig } from './configs/google.config';
import { IStorageConfig } from './configs/storage.config';

export enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export type IConfig = IAppConfig &
  IJwtConfig &
  IDatabaseConfig &
  IEtherealConfig &
  IGoogleConfig &
  IStorageConfig;

type Primitive = string | number | boolean | null | undefined;

// Recursively extract deep keys as dot-separated strings
export type FieldKeyType<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Primitive
    ? `${Prefix}${K}` // Direct key if it's a primitive
    : T[K] extends object
      ? `${Prefix}${K}` | FieldKeyType<T[K], `${Prefix}${K}.`> // Recurse into objects
      : never;
}[keyof T & string];

// Extract the value type for a given deep key
export type FieldType<
  T,
  K extends FieldKeyType<T>,
> = K extends `${infer First}.${infer Rest}` // If key is nested (has ".")
  ? First extends keyof T
    ? Rest extends FieldKeyType<T[First]> // Ensure valid deep key
      ? FieldType<T[First], Rest> // Recurse into the object
      : never
    : never
  : K extends keyof T
    ? T[K] // Direct key access
    : never;
