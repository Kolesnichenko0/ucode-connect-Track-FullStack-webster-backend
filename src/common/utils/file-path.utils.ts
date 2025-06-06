// src/common/utils/file-path.utils.ts
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';

export function normalizeFilePath(
    pathStr: string,
    separator: '/' | '\\' = '/',
): string {
    // For processing '.' and '..'
    const normalized = path.normalize(pathStr);

    if (separator === '/') {
        return normalized.replace(/\\/g, '/');
    } else {
        return normalized.replace(/\//g, '\\');
    }
}

export function buildFilePath(...paths: string[]): string {
    return normalizeFilePath(path.join(...paths));
}

export function getFileExtension(filename: string): string {
    return path.extname(filename).slice(1);
}

export function generateFileKey(): string {
    return uuidv4();
}

export function generateUniqueFilename(originalFilename: string): string {
    const fileKey = generateFileKey();
    const fileExt = path.extname(originalFilename).slice(1);
    return `${fileKey}.${fileExt}`;
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

export async function directoryExists(dirPath: string): Promise<boolean> {
    try {
        const stat = await fs.stat(dirPath);
        return stat.isDirectory();
    } catch {
        return false;
    }
}

export function buildUrl(baseUrl: string, ...segments: string[]): string {
    const normalizedBaseUrl = baseUrl.endsWith('/')
        ? baseUrl.slice(0, -1)
        : baseUrl;

    return `${normalizedBaseUrl}/${segments
        .map((segment) => segment.replace(/^\/|\/$/g, ''))
        .filter(Boolean)
        .join('/')}`;
}

export function buildBaseUrl(
    protocol: string,
    host: string,
    port: number,
): string {
    let constructedUrl = `${protocol}://${host}`;
    const isStandardPort =
        (protocol === 'http' && port === 80) ||
        (protocol === 'https' && port === 443);

    if (port && !isStandardPort) {
        constructedUrl += `:${port}`;
    }
    return constructedUrl;
}

async function cleanupDirectoryBase(
    dirPath: string,
    shouldDelete: (filename: string) => boolean,
    exceptionCount: number = 0
): Promise<void> {
    try {
        const exists = await directoryExists(dirPath);
        if (!exists) {
            console.log(`📁 Directory doesn't exist: ${dirPath}`);
            return;
        }

        const files = await fs.readdir(dirPath);
        let removedCount = 0;

        for (const file of files) {
            if (!shouldDelete(file)) {
                console.log(`⏭️  Skipped: ${file} (exception)`);
                continue;
            }

            const filePath = path.join(dirPath, file);
            const stat = await fs.stat(filePath);

            if (stat.isFile()) {
                await fs.unlink(filePath);
                console.log(`🗑️  Deleted: ${file}`);
                removedCount++;
            }
        }

        console.log(
            `✅ Cleaned directory: ${dirPath} (${removedCount} files removed, ${exceptionCount} exceptions kept)`,
        );
    } catch (error) {
        console.error(`❌ Error cleaning directory ${dirPath}:`, error);
    }
}

export async function cleanupDirectory(dirPath: string): Promise<void> {
    await cleanupDirectoryBase(dirPath, () => true, 0);
}

export async function cleanupDirectoryExcept(
    dirPath: string,
    exceptions: string[],
): Promise<void> {
    await cleanupDirectoryBase(dirPath, (file) => !exceptions.includes(file), exceptions.length);
}
