import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TargetType } from '@prisma/client';

export class UpdateFileDto {
  @ApiProperty({
    description: 'Is this a default file',
    type: 'boolean',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    description: 'Author ID',
    type: 'number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  authorId?: number | null;

  @ApiProperty({
    description: 'Target type',
    enum: TargetType,
    example: TargetType.USER_AVATAR,
    required: false,
  })
  @IsOptional()
  @IsEnum(TargetType)
  targetType?: TargetType;

  @ApiProperty({
    description: 'MIME type',
    type: 'string',
    example: 'image/png',
    required: false,
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({
    description: 'File extension',
    type: 'string',
    example: 'png',
    required: false,
  })
  @IsOptional()
  @IsString()
  extension?: string;
} 