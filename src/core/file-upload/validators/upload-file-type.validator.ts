import { FileValidator } from '@nestjs/common';
// const fileType = require('file-type-mime'); //TODO: Посмотреть про эту библиотеку. Почему она не импортится. Может она старая? и нужно использовать более новую?
import { fromBuffer } from 'file-type';
import * as path from 'path';

interface UploadFileTypeValidatorOptions {
  allowedMimeTypes: string[];
  allowedExtentions: string[]
}

export class UploadFileTypeValidator extends FileValidator<
  UploadFileTypeValidatorOptions,
  Express.Multer.File
> {
  private allowedMimeTypes: string[];
  private allowedExtentions: string[];

  constructor(
    protected readonly validationOptions: UploadFileTypeValidatorOptions,
  ) {
    super(validationOptions);
    this.allowedMimeTypes = this.validationOptions.allowedMimeTypes;
    this.allowedExtentions = this.validationOptions.allowedExtentions;
  }

  public async isValid(
    file?:
      | Express.Multer.File
      | Express.Multer.File[]
      | Record<string, Express.Multer.File[]>,
  ): Promise<boolean> {
    if (!file) {
      return false;
    }

    if (Array.isArray(file)) {
      return file.every((f) => this.validateFile(f));
    }

    if (typeof file === 'object' && 'buffer' in file) {
      return await this.validateFile(file as Express.Multer.File);
    }

    if (typeof file === 'object' && !Array.isArray(file)) {
      let isFilesValid = false;
      for (const fileField in file) {
        if (Object.prototype.hasOwnProperty.call(file, fileField)) {
          const files = (file as Record<string, Express.Multer.File[]>)[
            fileField
          ];
          if (Array.isArray(files)) {
            isFilesValid = files.every((f) => this.validateFile(f));
          } else {
            return false;
          }
        }
      }
      return isFilesValid;
    }

    return false;
  }

  public buildErrorMessage(): string {
    return `Upload not allowed. Upload only files of type: ${this.allowedExtentions.join(
      ', ',
    )}`;
  }

  private async validateFile(file: Express.Multer.File): Promise<boolean> {
    const fileExt = path.extname(file.originalname);

    if (!this.allowedExtentions.includes(fileExt)) return false;

    const response = await fromBuffer(file.buffer);
    
    if (!response) {
      return false;
    }

    if (file.mimetype !== response.mime){
      return false;
    }

    return this.allowedMimeTypes.includes(response.mime);
  }
}
