export const UPLOAD_ALLOWED_MAX_FILE_SIZES = {
    USER_AVATAR: 5 * 1024 * 1024,
    PROJECT_ASSET: 10 * 1024 * 1024,
    PROJECT_BACKGROUND: 10 * 1024 * 1024,
    PROJECT_ELEMENT: 10 * 1024 * 1024,
    FONT_ASSET: 5 * 1024 * 1024,
} as const;

export const UPLOAD_ALLOWED_FILE_MIME_TYPES = {
    USER_AVATAR: ['image/jpeg', 'image/png', 'image/webp'],
    PROJECT_ASSET: ['image/jpeg', 'image/png', 'image/webp'],
    PROJECT_BACKGROUND: [
        'image/jpeg',
        'image/png',
    ],
    PROJECT_ELEMENT: [
        'image/png',
        'image/webp',
    ],
    FONT_ASSET: [
        'font/ttf',
        'font/otf',
        'application/font-sfnt',
        'font/woff',
        'font/woff2',
        'application/font-woff',
        'application/font-woff2',
    ],
} as const;

export const UPLOAD_ALLOWED_FILE_EXTENSIONS = {
    USER_AVATAR: ['.jpg', '.jpeg', '.png', '.webp'],
    PROJECT_ASSET: ['.jpg', '.jpeg', '.png', '.webp'],
    PROJECT_BACKGROUND: ['.jpg', '.jpeg', '.png'],
    PROJECT_ELEMENT: ['.png', '.webp'],
    FONT_ASSET: ['.ttf', '.otf', '.woff', '.woff2'],
} as const;
