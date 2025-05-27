import { File as PrismaFile, TargetType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export const SERIALIZATION_GROUPS = {
  BASIC: ['basic'],
  FULL: ['basic', 'full'],
};

export class File implements PrismaFile {
  @Expose({ groups: ['basic'] })
  @ApiProperty({
    description: 'File identifier',
    nullable: false,
    type: 'number',
    example: 1,
  })
  id: number;

  @Expose({ groups: ['basic'] })
  @ApiProperty({
    description: 'Author ID',
    nullable: true,
    type: 'number',
    example: 1,
  })
  authorId: number | null;

  @Expose({ groups: ['basic'] })
  @ApiProperty({
    description: 'Is this a default file',
    nullable: false,
    type: 'boolean',
    example: false,
  })
  isDefault: boolean;

  @Expose({groups: ['basic']})
  @ApiProperty({
    description: 'TargetId',
    nullable: true,
    type: 'number',
    example: 1
  })
  targetId: number;

  @Expose({ groups: ['basic'] })
  @ApiProperty({
    description: 'Target type',
    enum: TargetType,
    example: TargetType.USER_AVATAR,
  })
  targetType: TargetType;

  @Expose({ groups: ['basic'] })
  @ApiProperty({
    description: 'Unique file key',
    nullable: false,
    type: 'string',
    example: 'e12e3456-e789-12d3-a456-426614174000',
  })
  fileKey: string;

  @Expose({ groups: ['basic'] })
  @ApiProperty({
    description: 'MIME type',
    nullable: false,
    type: 'string',
    example: 'image/png',
  })
  mimeType: string;

  @Expose({ groups: ['basic'] })
  @ApiProperty({
    description: 'File extension',
    nullable: false,
    type: 'string',
    example: 'png',
  })
  extension: string;

  @Expose({ groups: ['basic'] })
  @ApiProperty({
    description: 'Creation date',
    nullable: false,
    type: 'string',
    example: '2025-04-08T05:54:45.000Z',
  })
  createdAt: Date;

  @Expose({ groups: ['full'] })
  updatedAt: Date;

  @Expose({ groups: ['basic'] })
  @ApiProperty({
    description: 'Deleted date',
    nullable: true, 
    type: 'string',
    example: '2025-05-08T05:54:45.000Z',
  })
  deletedAt: Date;
} 