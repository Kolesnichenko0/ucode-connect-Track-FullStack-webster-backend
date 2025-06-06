// src/core/files/dto/upload-file.dto.ts
import { FileTargetType } from '@prisma/client';
import { IsBooleanField, IsEnglishName, IsEnumValue, IsId } from 'src/common/validators';

export class UploadFileDto {
  @IsId(true)
  authorId?: number;

  @IsEnumValue(FileTargetType, false)
  targetType: FileTargetType;

  @IsId(true)
  targetId?: number;

  @IsBooleanField(true)
  isDefault?: boolean = false;

  @IsEnglishName(true)
  fileKey?: string;
}
