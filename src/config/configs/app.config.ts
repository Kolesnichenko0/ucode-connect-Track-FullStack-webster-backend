// src/config/configs/app.config.ts
import { z } from 'zod';
import { ConfigValidator } from '../config.validator';
import { Env } from '../config.interface';
import * as path from 'path';

const AppSchema = z.object({
  APP_NAME: z.string().default('webster'),
  NODE_ENV: z.nativeEnum(Env).default(Env.DEVELOPMENT),
  APP_SUPPORT_EMAIL: z.string().email().default('support@webster.com'),
  APP_DOMAIN: z.string().default('webster.com'),
  APP_GLOBAL_PREFIX: z.string().default('api'),
  APP_BASE_PUBLIC_ASSETS_PATH: z.string().default('./public/assets'),
  APP_SERVER_PORT: z.coerce.number().default(8080),
  APP_SERVER_HOST: z.string().default('localhost'),
  APP_SERVER_PROTOCOL: z.string().default('http'),
  APP_CLIENT_PORT: z.coerce.number().default(5173),
  APP_CLIENT_HOST: z.string().default('localhost'),
  APP_CLIENT_PROTOCOL: z.string().default('http'),
  APP_LOGO_FILENAME: z.string().default('logo.png'),
  APP_CORS_METHODS: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  APP_CORS_ALLOWED_HEADERS: z.array(z.string()).default(['Content-Type', 'Authorization', 'X-CSRF-TOKEN']),
  APP_CORS_CREDENTIALS: z.boolean().default(true),
  APP_CSRF_COOKIE_KEY: z.string().default('X-CSRF-SECRET'),
  APP_CSRF_COOKIE_HTTP_ONLY: z.boolean().default(true),
  APP_CSRF_COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('strict'),
  APP_CSRF_COOKIE_SECURE: z.boolean().default(false),
  APP_CSRF_IGNORE_METHODS: z.array(z.string()).default(['GET', 'HEAD', 'OPTIONS']),
});

export type IAppConfig = ReturnType<typeof getAppConfig>;

const getAppConfig = () => {
  const config = ConfigValidator.validate(process.env, AppSchema) as z.infer<typeof AppSchema>;

  const buildUrl = (protocol: string, host: string, port: number): string => {
    let constructedUrl = `${protocol}://${host}`;
    if (port && !((protocol === 'http' && port === 80) || (protocol === 'https' && port === 443))) {
      constructedUrl += `:${port}`;
    }
    return constructedUrl;
  };

  const serverUrl = buildUrl(config.APP_SERVER_PROTOCOL, config.APP_SERVER_HOST, config.APP_SERVER_PORT);
  const clientUrl = buildUrl(config.APP_CLIENT_PROTOCOL, config.APP_CLIENT_HOST, config.APP_CLIENT_PORT);

  const basePublicAssetsPath = config.APP_BASE_PUBLIC_ASSETS_PATH;

  return {
    app: {
      name: config.APP_NAME,
      env: config.NODE_ENV,
      globalPrefix: config.APP_GLOBAL_PREFIX,
      supportEmail: config.APP_SUPPORT_EMAIL,
      domain: config.APP_DOMAIN,
      serverPort: config.APP_SERVER_PORT,
      serverHost: config.APP_SERVER_HOST,
      serverProtocol: config.APP_SERVER_PROTOCOL,
      serverUrl,
      clientProtocol: config.APP_CLIENT_PROTOCOL,
      clientHost: config.APP_CLIENT_HOST,
      clientPort: config.APP_CLIENT_PORT,
      clientUrl,
      paths: {
        basePublicAssets: basePublicAssetsPath,
        publicAssets: {
          illustrations: path.join(basePublicAssetsPath, 'images', 'defaultIllustrations'),
          logos: path.join(basePublicAssetsPath, 'images', 'logos'),
          avatars: path.join(basePublicAssetsPath, 'images', 'avatars'),
          fonts: path.join(basePublicAssetsPath, 'fonts'),
          //http://localhost:8080/public/static/avatars/
          //./public/static/avatars/...
        }
      },
      logo: {
        filename: config.APP_LOGO_FILENAME,
      },
      cors: {
        methods: config.APP_CORS_METHODS,
        allowedHeaders: config.APP_CORS_ALLOWED_HEADERS,
        credentials: config.APP_CORS_CREDENTIALS,
      },
      csrf: {
        cookie: {
          key: config.APP_CSRF_COOKIE_KEY,
          secure: config.APP_CSRF_COOKIE_SECURE,
          httpOnly: config.APP_CSRF_COOKIE_HTTP_ONLY,
          sameSite: config.APP_CSRF_COOKIE_SAME_SITE,
        },
        ignoreMethods: config.APP_CSRF_IGNORE_METHODS,
      }
    },
  };
};

export default getAppConfig;

