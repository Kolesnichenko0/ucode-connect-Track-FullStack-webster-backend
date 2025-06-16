// src/core/photos/services/pollinations.service.ts
import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import { PHOTO_CONSTANTS } from './constants/photos.constants';

@Injectable()
export class PollinationsService {
    private readonly apiUrl = PHOTO_CONSTANTS.POLLINATIONS.URL;

    async generateImageBuffer(prompt: string): Promise<Buffer> {
        const encodedPrompt = encodeURIComponent(prompt);
        const generationUrl = `${this.apiUrl}/${encodedPrompt}`;

        const response = await axios.get(generationUrl, {
            responseType: 'arraybuffer',
            timeout: 120_000,
        });

        if (
            !response.headers['content-type'] ||
            !response.headers['content-type'].startsWith('image/')
        ) {
            throw new InternalServerErrorException(
                'Pollinations did not return an image. Try again later.',
            );
        }

        return Buffer.from(response.data);
    }
}
