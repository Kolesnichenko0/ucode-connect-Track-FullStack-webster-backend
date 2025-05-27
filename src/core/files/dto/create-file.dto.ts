// src/core/files/dto/create-file.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TargetType } from '@prisma/client';
import { IsBooleanField, IsEnumValue, IsId } from 'src/common/validators';

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

  @ApiProperty({ enum: TargetType, description: 'Type of the target entity' })
  @IsEnumValue(TargetType, false)
  targetType: TargetType;

  @ApiProperty({ description: 'Unique key for the file' })
  @IsUUID('4', { message: 'Invalid UUID format' })
  fileKey: string;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsNotEmpty()
  @IsString()//TODO: Доделать 
  mimeType: string;

  @ApiProperty({ description: 'File extension' })
  @IsNotEmpty()
  @IsString()
  extension: string;
}
