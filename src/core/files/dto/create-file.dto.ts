// src/core/files/dto/create-file.dto.ts
import { FileTargetType } from '@prisma/client';
import { IsBooleanField, IsEnumValue, IsId } from 'src/common/validators';
import { IsUuidValue } from '../../../common/validators/uuid.validator';
import { IsFileMimeType } from '../validators/file-mime-type.validator';
import { IsFileExtension } from '../validators/file-extension.validator';

export class CreateFileDto {
  @IsId(true)
  authorId?: number;

  @IsBooleanField(true)
  isDefault?: boolean = false;

  @IsId(true)
  targetId?: number;

  @IsEnumValue(FileTargetType, false)
  targetType: FileTargetType;

  @IsUuidValue(false)
  fileKey: string;

  @IsFileMimeType(false)
  mimeType: string;

  @IsFileExtension(false)
  extension: string;
}
