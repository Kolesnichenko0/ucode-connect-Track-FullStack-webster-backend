// src/core/files/dto/file-metadata.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { TargetType } from '@prisma/client';
import { IsBooleanField, IsEnumValue, IsId } from 'src/common/validators';

export class UploadFileDto {
  @ApiPropertyOptional({ description: 'ID of the author (user)' })
  @IsId(true)
  authorId?: number;

  @ApiProperty({ enum: TargetType, description: 'Type of the target entity' })
  @IsEnumValue(TargetType, false)
  targetType: TargetType;

  @ApiPropertyOptional({ description: 'ID of the target entity' })
  @IsId(true)
  targetId?: number;

  @ApiPropertyOptional({ description: 'Default file or not' })
  @IsBooleanField(true)
  isDefault?: boolean = false;
}
