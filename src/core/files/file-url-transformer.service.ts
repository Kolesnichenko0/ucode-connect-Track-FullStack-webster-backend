// src/core/files/file-url-transformer.service.ts
import { Injectable } from '@nestjs/common';
import { FilePathsService } from './file-paths.service';
import { FilesService } from './files.service';
import { FileFieldConfig } from './interfaces/file-field-config.interface';
import { File } from './entities/file.entity';

@Injectable()
export class FileUrlTransformerService {
    constructor(
        private readonly filePathsService: FilePathsService,
        private readonly filesService: FilesService,
    ) {}

    async transform<T extends Record<string, any>>(
        data: T | T[],
        configs: FileFieldConfig[],
    ): Promise<T | T[]> {
        if (Array.isArray(data)) {
            return Promise.all(
                data.map((item) => this.transformSingle(item, configs)),
            );
        }

        return this.transformSingle(data, configs);
    }

    /**
     * Converts file fields to URLs for a single object
     */
    private async transformSingle<T extends Record<string, any>>(
        data: T,
        configs: FileFieldConfig[],
    ): Promise<T> {
        if (!data || typeof data !== 'object') {
            return data;
        }

        // Create a copy of the object for security
        const result = { ...data } as Record<string, any>;

        // Process each file field configuration
        for (const config of configs) {
            await this.processFileField(result, config);
        }

        // Recursively process nested objects and arrays
        await this.processNestedObjects(result, configs);

        return result as T;
    }

    private async processFileField(
        obj: Record<string, any>,
        config: FileFieldConfig,
    ): Promise<void> {
        const { fileIdField, fileObjectField, urlField, fileKeyField } = config;

        try {
            let file: File | null = null;
            let fileUrl: string | null = null;

            // First we try to get the file from the object (if it is loaded)
            if (fileObjectField && obj[fileObjectField]) {
                file = obj[fileObjectField] as File;
            }
            // If there is no file object, but there is an ID - load the file
            else if (obj[fileIdField]) {
                const fileId = obj[fileIdField] as number;
                file = await this.filesService.findById(fileId);
            }

            if (file) {
                fileUrl = this.filePathsService.getFileUrl(file);
                obj[urlField] = fileUrl;

                if (fileKeyField && file.fileKey) {
                    obj[fileKeyField] = file.fileKey;
                }
            } else {
                obj[urlField] = null;
            }

            delete obj[fileIdField];
            if (fileObjectField) {
                delete obj[fileObjectField];
            }

        } catch (error) {
            console.error(
                `Error processing file field ${fileIdField}: ${error.message}`,
            );

            obj[urlField] = null;
            if (fileKeyField) {
                obj[fileKeyField] = null;
            }
            delete obj[fileIdField];
            if (fileObjectField) {
                delete obj[fileObjectField];
            }
        }
    }

    /**
     * Recursively handles nested objects and arrays
     */
    private async processNestedObjects(
        obj: Record<string, any>,
        configs: FileFieldConfig[],
    ): Promise<void> {
        for (const [key, value] of Object.entries(obj)) {
            if (value && typeof value === 'object' && !(value instanceof Date)) {
                if (Array.isArray(value)) {
                    obj[key] = await Promise.all(
                        value.map((item) => {
                            if (item && typeof item === 'object' && !(item instanceof Date)) {
                                return this.transformSingle(item, configs);
                            }
                            return item;
                        }),
                    );
                } else {
                    obj[key] = await this.transformSingle(value, configs);
                }
            }
        }
    }

    static createConfig(
        fileIdField: string,
        urlField: string,
        fileObjectField?: string,
        fileKeyField?: string,
    ): FileFieldConfig {
        return {
            fileIdField,
            fileObjectField,
            urlField,
            fileKeyField,
        };
    }

    static readonly COMMON_CONFIGS = {
        USER_AVATAR: FileUrlTransformerService.createConfig(
            'avatarFileId',
            'avatarFileURL',
            'avatarFile',
            'avatarFileKey',
        ),

        PROJECT_PREVIEW: FileUrlTransformerService.createConfig(
            'previewFileId',
            'previewFileURL',
            'previewFile'
        ),

        FONT_ASSET: FileUrlTransformerService.createConfig(
            'fileId',
            'fileURL',
            'file'
        ),
    } as const;
}
