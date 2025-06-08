// src/core/projects/guards/can-copy-project.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { ProjectsService } from '../projects.service';

@Injectable()
export class CanCopyProjectGuard implements CanActivate {
    constructor(private readonly projectsService: ProjectsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const projectId = parseInt(request.params.id, 10);
        const user = request.user;

        if (!user || !user.userId) {
            throw new ForbiddenException('User not authenticated');
        }

        if (!projectId || isNaN(projectId)) {
            throw new NotFoundException('Invalid project ID');
        }

        const projectToCopy = await this.projectsService.findById(projectId);

        if (!projectToCopy) {
            throw new NotFoundException('Project to copy not found');
        }

        if (projectToCopy.authorId === null && projectToCopy.isTemplate) {
            return true;
        }

        if (projectToCopy.authorId === user.userId) {
            return true;
        }

        throw new ForbiddenException('You do not have permission to copy this project.');
    }
}
