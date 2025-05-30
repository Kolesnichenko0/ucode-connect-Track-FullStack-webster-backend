// src/common/utils/path.utils.ts
import * as path from 'path';

/**
 * Нормализует путь, заменяя разделители на указанный формат
 * @param pathStr Путь для нормализации
 * @param separator Разделитель для использования (по умолчанию '/')
 * @returns Нормализованный путь
 */
export function normalizePath(pathStr: string, separator: '/' | '\\' = '/'): string {
    // Сначала используем встроенную нормализацию path.normalize для обработки . и ..
    const normalized = path.normalize(pathStr);

    // Затем заменяем все разделители на требуемый формат
    if (separator === '/') {
        return normalized.replace(/\\/g, '/');
    } else {
        return normalized.replace(/\//g, '\\');
    }
}

/**
 * Соединяет сегменты пути и нормализует результат с указанным разделителем
 * @param separator Разделитель для использования (по умолчанию '/')
 * @param paths Сегменты пути для объединения
 * @returns Нормализованный объединенный путь
 */
export function joinPath(separator: '/' | '\\' = '/', ...paths: string[]): string {
    const joined = path.join(...paths);
    return normalizePath(joined, separator);
}
