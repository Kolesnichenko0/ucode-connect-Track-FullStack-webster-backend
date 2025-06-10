// src/modules/projects/projects-pagination.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/db/database.service';
import { PaginationBaseRepository } from '../../common/pagination';
import { Prisma } from '@prisma/client';
import { Project } from './entities/project.entity'
import { GetProjectsDto } from './dto/get-projects.dto';
import { GetTemplatesDto } from './dto/get-templates.dto';
import { CursorConfig, ProjectCursor, CursorPaginationResult } from '../../common/pagination/cursor';

@Injectable()
export class ProjectsPaginationRepository extends PaginationBaseRepository<Project> {
    constructor(db: DatabaseService) {
        super(db);
    }

    async findAllTemplatesWithCursor(
        filters: GetTemplatesDto,
    ): Promise<CursorPaginationResult<Project, ProjectCursor>> {
        const { after, limit, title} = filters;

        const where: Prisma.ProjectWhereInput = { authorId: null, isTemplate: true};
        if (title) where.title = { contains: title };

        const query = {
            where,
            orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        };

        const cursorConfig = this.getProjectCursorConfig();

        return this.paginateCursor('project', query, after || null, limit, cursorConfig);
    }

    async findByAuthorIdWithCursor(
        authorId: number,
        filters: GetProjectsDto,
    ): Promise<CursorPaginationResult<Project, ProjectCursor>> {
        const { is_template, title, after, limit } = filters;

        const where: Prisma.ProjectWhereInput = { authorId };
        if (is_template !== undefined) where.isTemplate = is_template;
        if (title) where.title = { contains: title };

        const query = {
            where,
            orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        };

        const cursorConfig = this.getProjectCursorConfig();

        return this.paginateCursor('project', query, after || null, limit, cursorConfig);
    }

    private getProjectCursorConfig(): CursorConfig<Project, ProjectCursor> {
        return {
            cursorFields: ['updatedAt', 'id'],
            fieldTypes: { updatedAt: 'date', id: 'number' },
            sortDirections: { updatedAt: 'DESC', id: 'DESC' },
        };
    }
}
