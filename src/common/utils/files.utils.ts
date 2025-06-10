// src/common/utils/file-path.utils.ts
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import axios from 'axios';

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

export function parseFilename(filename: string): { key: string, extension: string } {
    if (!filename || typeof filename !== 'string') {
        throw new Error('Filename must be a non-empty string');
    }

    const invalidCharsPattern = /[<>:"/\\|?*\x00-\x1F]/;
    if (invalidCharsPattern.test(filename)) {
        throw new Error('Filename contains invalid characters');
    }

    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) {
        throw new Error('Filename must have an extension');
    }
    if (lastDotIndex === 0) {
        throw new Error('Filename must have a name before extension');
    }
    if (lastDotIndex === filename.length - 1) {
        throw new Error('Extension cannot be empty');
    }

    return {
        key: filename.substring(0, lastDotIndex),
        extension: filename.substring(lastDotIndex + 1)
    };
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

export function isBase64Image(str: string | undefined | null): str is string {
    return typeof str === 'string' && str.startsWith('data:image/');
}

export async function convertBase64ToFile(
    base64: string,
    filename: string,
): Promise<Express.Multer.File> {
    const matches = base64.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
        throw new BadRequestException('Invalid base64 image format');
    }

    const [, ext, data] = matches;
    const buffer = Buffer.from(data, 'base64');

    return {
        buffer,
        originalname: filename,
        mimetype: `image/${ext}`,
        size: buffer.length,
    } as Express.Multer.File;
}

export function isURL(str: string | undefined | null): str is string {
    if (typeof str !== 'string' || str.length === 0) {
        return false;
    }
    return str.startsWith('http://') || str.startsWith('https://');
}

export async function downloadFileFromUrl(
    url: string,
    asStream = false,
): Promise<Buffer | Readable> {
    try {
        if (asStream) {
            const response = await axios.get(url, {
                responseType: 'stream',
            });
            return response.data;
        } else {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
            });
            return Buffer.from(response.data, 'binary');
        }
    } catch (error) {
        console.error(`Error downloading file from URL ${url}:`, error);
        throw new Error(`Failed to download file: ${error.message}`);
    }
}
