// src/common/pipes/parse-files.pipe.ts
import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
    Optional,
} from '@nestjs/common';

export interface ParseFilesPipeOptions {
    validators: (new (options?: any) => {
        isValid(file?: Express.Multer.File): boolean | Promise<boolean>;
        buildErrorMessage(file?: Express.Multer.File): string;
    })[];
    optionsForEachValidator?: any[];
    optional?: boolean;
    maxCount?: number;
}

@Injectable()
export class ParseFilesPipe implements PipeTransform<Express.Multer.File[] | undefined, Promise<Express.Multer.File[] | undefined>> {
    // ... (конструктор залишається тим самим) ...
    protected readonly validators: {
        isValid(file?: Express.Multer.File): boolean | Promise<boolean>;
        buildErrorMessage(file?: Express.Multer.File): string;
    }[];
    protected readonly optional: boolean;
    protected readonly maxCount?: number;

    constructor(@Optional() options?: ParseFilesPipeOptions) {
        this.validators = [];
        if (options?.validators) {
            options.validators.forEach((ValidatorClass, index) => {
                const validatorOptions = options.optionsForEachValidator?.[index] || {};
                this.validators.push(new ValidatorClass(validatorOptions));
            });
        }
        this.optional = options?.optional ?? false;
        this.maxCount = options?.maxCount;
    }


    async transform(
        files: Express.Multer.File[] | undefined,
        metadata: ArgumentMetadata,
    ): Promise<Express.Multer.File[] | undefined> {
        if (!files || files.length === 0) {
            if (this.optional) {
                return undefined;
            }
            throw new BadRequestException('No files uploaded.');
        }

        if (this.maxCount !== undefined && files.length > this.maxCount) {
            throw new BadRequestException(
                `Too many files. Maximum allowed is ${this.maxCount}, but ${files.length} were uploaded.`,
            );
        }

        const validationErrors: { fileName: string; errors: string[] }[] = [];

        await Promise.all(files.map(async (file) => {
            const currentFileErrors: string[] = [];
            for (const validator of this.validators) {
                // Очікуємо результат, якщо isValid повертає Promise
                const isValidResult = await validator.isValid(file);
                if (!isValidResult) {
                    currentFileErrors.push(validator.buildErrorMessage(file));
                }
            }
            if (currentFileErrors.length > 0) {
                validationErrors.push({ fileName: file.originalname, errors: currentFileErrors });
            }
        }));

        if (validationErrors.length > 0) {
            const errorMessages = validationErrors
                .map(err => `File "${err.fileName}": ${err.errors.join(', ')}`)
                .join('; ');
            throw new BadRequestException(`File validation failed: ${errorMessages}`);
        }

        return files;
    }
}
