// src/core/projects/projects.repository.ts
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/db/database.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GetProjectsCursorDto } from './dto/get-projects-cursor.dto';
import { Project } from './entities/project.entity';
import { GetProjectsDto } from './dto/get-projects.dto';

@Injectable()
export class ProjectsRepository {
    constructor(private readonly db: DatabaseService) {}

    async create(data: CreateProjectDto & { previewFileId: number; authorId?: number }): Promise<Project> {
        return this.db.project.create({
            data,
        });
    }

    async findAllTemplates(): Promise<{ projects: Project[]; total: number }> {
        const [projects, total] = await Promise.all([
            this.db.project.findMany({
                where: {
                    authorId: null,
                    isTemplate: true,
                },
                orderBy: { updatedAt: 'desc' },
            }),
            this.db.project.count({
                where: {
                    authorId: null,
                    isTemplate: true,
                },
            }),
        ]);

        return { projects, total };
    }

    async findByAuthorId(
        authorId: number,
        filters: GetProjectsDto,
    ): Promise<{ projects: Project[]; total: number }> {
        const { is_template, title} = filters;

        const whereConditions: any = {
            authorId,
        };

        if (is_template !== undefined) {
            whereConditions.isTemplate = is_template;
        }

        if (title) {
            whereConditions.title = {
                contains: title,
            };
        }

        const [projects, total] = await Promise.all([
            this.db.project.findMany({
                where: whereConditions,
                orderBy: { updatedAt: 'desc' },
            }),
            this.db.project.count({
                where: whereConditions,
            }),
        ]);

        return { projects, total };
    }

    async findById(
        id: number,
    ): Promise<Project | null> {
        return this.db.project.findUnique({
            where: {
                id
            }
        });
    }

    async findByIdAndAuthor(
        id: number,
        authorId: number,
    ): Promise<Project | null> {
        return this.db.project.findUnique({
            where: {
                id,
                authorId,
            },
        });
    }

    async update(id: number, data: Partial<Project>): Promise<Project> {
        return this.db.project.update({
            where: { id },
            data: data as any,
        });
    }

    async delete(id: number): Promise<void> {
        await this.db.project.delete({
            where: { id },
        });
    }
}
