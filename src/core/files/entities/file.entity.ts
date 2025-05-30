import { File as PrismaFile, FileTargetType } from '@prisma/client';

export class File implements PrismaFile {
  id: number;

  authorId: number | null;

  isDefault: boolean;

  targetId: number | null;

  targetType: FileTargetType;

  fileKey: string;

  mimeType: string;

  extension: string;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;
}
