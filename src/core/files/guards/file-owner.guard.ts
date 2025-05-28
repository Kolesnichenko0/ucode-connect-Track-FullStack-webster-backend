// src/core/files/guards/file-owner.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FilesService } from '../files.service';

@Injectable()
export class FileOwnerGuard implements CanActivate {
  constructor(private readonly filesService: FilesService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const fileKey = request.params.fileKey;

    const file = await this.filesService.findByFileKey(fileKey);

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    if (file.isDefault) {
      throw new BadRequestException('There is another route for default assets');
    }

    if (user.userId != file.authorId) {
      throw new ForbiddenException(
        'You can only access your own file',
      );
    }

    return true;
  }
}
