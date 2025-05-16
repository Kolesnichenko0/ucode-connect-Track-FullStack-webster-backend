// src/config/config.validator.ts
import { ZodSchema } from 'zod';

export class ConfigValidator {
  private static formatZodError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (Array.isArray(error)) {
      return error.join(', ');
    }
    if (typeof error === 'object' && error !== null) {
      return Object.entries(error)
        .map(
          ([key, value]) => `${key}: ${ConfigValidator.formatZodError(value)}`,
        )
        .join(', ')
        .toString();
    }
    return String(error);
  }

  static validate<T extends object>(
    config: Record<string, unknown>,
    schema: ZodSchema<T>,
  ): T {
    const parsedConfig = schema.safeParse(config);
    if (!parsedConfig.success) {
      throw new Error(
        `Configuration validation error: ${ConfigValidator.formatZodError(parsedConfig.error)}`,
      );
    }
    return parsedConfig.data;
  }
}
