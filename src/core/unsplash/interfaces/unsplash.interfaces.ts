// src/core/unsplash/interfaces/unsplash.interfaces.ts
export interface UnsplashPhotoResponse {
    id: string;
    urls: {
        raw: string;
        full: string;
        regular: string;
        small: string;
        thumb: string;
    };
    links: {
        self: string;
        html: string;
        download: string;
        download_location: string;
    };
    user: {
        name: string;
        username: string;
    };
    description: string | null;
    alt_description: string | null;
}

export interface UnsplashSearchOptions {
    query: string;
    page?: number;
    perPage?: number;
    orientation?: 'landscape' | 'portrait' | 'squarish';
    collections?: string[];
    contentFilter?: 'low' | 'high';
    color?: string;
}

export interface UnsplashRandomPhotoOptions {
    query?: string;
    orientation?: 'landscape' | 'portrait' | 'squarish';
    count?: number;
    collections?: string[];
    contentFilter?: 'low' | 'high';
    featured?: boolean;
}

export interface UnsplashRateLimitInfo {
    limit: number;
    remaining: number;
    lastUpdated: Date;
}

export interface UnsplashImageOptions {
    width?: number;
    height?: number;
    fit?: 'crop' | 'clamp' | 'fill' | 'clip';
    cropMode?: 'face' | 'faces' | 'center' | 'edges' | 'entropy';
    quality?: number; // 1-100
    format?: 'jpg' | 'png' | 'webp' | 'avif';
    blur?: number; // 0-2000 pixels
    brightness?: number; // -100 to 100
    contrast?: number; // -100 to 100
    saturation?: number; // -100 to 100
}

export interface UnsplashPhotoDownloadInfo {
    id?: string;
    download_location?: string;
}
