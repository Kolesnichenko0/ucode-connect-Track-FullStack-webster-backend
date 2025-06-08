// src/core/projects/guards/project-owner.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { ProjectsService } from '../projects.service';
import { SERIALIZATION_GROUPS } from '../entities/project.entity';

@Injectable()
export class ProjectOwnerGuard implements CanActivate {
    constructor(private readonly projectsService: ProjectsService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const projectId = parseInt(request.params.id);
        const user = request.user;
        const method = request.method;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        if (!projectId || isNaN(projectId)) {
            throw new NotFoundException('Invalid project ID');
        }

        console.log(`Project ${request.params.id}`);
        const project = await this.projectsService.findById(projectId, SERIALIZATION_GROUPS.DETAILED, false);
        console.log(`Project: `, project);

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (project.authorId === null && project.isTemplate) {
            if (method === 'GET') {
                return true;
            } else {
                throw new ForbiddenException('System templates cannot be modified by regular users.');
            }
        }

        if (project.authorId !== user.userId) {
            throw new ForbiddenException('You can only access your own projects');
        }

        return true;
    }
}
