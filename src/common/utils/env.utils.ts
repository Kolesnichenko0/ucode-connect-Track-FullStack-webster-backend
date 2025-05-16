// src/common/utils/env.utils.ts
export function validateEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export function getEnvSafe(name: string): string | null {
    try {
        return process.env[name] || null;
    } catch (error) {
        return null;
    }
}
