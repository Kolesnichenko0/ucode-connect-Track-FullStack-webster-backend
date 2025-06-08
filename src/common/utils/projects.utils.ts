// src/common/utils/project.utils.ts

import { BadRequestException } from '@nestjs/common';
import { Express } from 'express';

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
    // Перевіряємо, чи починається рядок з http:// або https://
    return str.startsWith('http://') || str.startsWith('https://');
}




