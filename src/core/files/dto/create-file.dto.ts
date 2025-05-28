// src/core/files/dto/create-file.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { FileTargetType } from '@prisma/client';
import { IsBooleanField, IsEnumValue, IsId } from 'src/common/validators';
import { IsUuidValue } from '../../../common/validators/uuid.validator';
import { IsFileMimeType } from '../validators/file-mime-type.validator';
import { IsFileExtension } from '../validators/file-extension.validator';

export class CreateFileDto {
  @ApiPropertyOptional({ description: 'ID of the author (user)' })
  @IsId(true)
  authorId?: number;

  @ApiPropertyOptional({ description: 'Whether the file is a default file' })
  @IsBooleanField(true)
  isDefault?: boolean = false;

  @ApiPropertyOptional({ description: 'ID of the target entity' })
  @IsId(true)
  targetId?: number;

  @ApiProperty({ enum: FileTargetType, description: 'Type of the target entity' })
  @IsEnumValue(FileTargetType, false)
  targetType: FileTargetType;

  @ApiProperty({ description: 'Unique key for the file' })
  @IsUuidValue(false)
  fileKey: string;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsFileMimeType(false)
  mimeType: string;

  @ApiProperty({ description: 'File extension' })
  @IsFileExtension(false)
  extension: string;
}
