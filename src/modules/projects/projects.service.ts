// src/core/projects/projects.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ImATeapotException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GetProjectsCursorDto } from './dto/get-projects-cursor.dto'; //TODO: где должжна быть эта ДТОшка
import { ProjectFilesResponseDto } from './dto/project-files-response.dto';
import { CopyProjectResponseDto } from './dto/copy-project-response.dto';
import { SERIALIZATION_GROUPS, Project } from './entities/project.entity';
import { FilesService } from '../../core/files/files.service';
import { FileUploadService } from '../../core/file-upload/file-upload.service';
import { FilePathsService } from '../../core/files/file-paths.service';
import { UploadFileDto } from 'src/core/file-upload/dto/upload-file.dto';
import { File as PrismaFile, FileTargetType } from '@prisma/client';
import * as fsPromises from 'fs/promises';
import { isUUID } from 'class-validator';
import { convertBase64ToFile, isBase64Image } from '../../common/utils';
import { GetProjectsDto } from './dto/get-projects.dto';
import { ProjectsPaginationRepository } from './projects-pagination.repository';
import { CursorPaginationResult, ProjectCursor } from '../../common/pagination/cursor';
import { GetTemplatesDto } from './dto/get-templates.dto';

@Injectable()
export class ProjectsService {
    private readonly PROJECT_ASSET_TARGET_TYPE = FileTargetType.PROJECT_ASSET;
    private readonly PROJECT_PREVIEW_TARGET_TYPE =
        FileTargetType.PROJECT_PREVIEW;
    private readonly DEFAULT_ASSET_KEY = 'default-project-asset';

    constructor(
        private readonly projectsRepository: ProjectsRepository,
        private readonly filesService: FilesService,
        private readonly fileUploadService: FileUploadService,
        private readonly filePathsService: FilePathsService,
        private readonly projectsPaginationRepository: ProjectsPaginationRepository
    ) {}

    async create(dto: CreateProjectDto, authorId?: number): Promise<Project> {
        const { previewFileId, processedContent } =
            await this.processProjectContent(dto.content, authorId);

        const projectData = {
            ...dto,
            content: processedContent,
            previewFileId,
            authorId,
        };

        const project = await this.projectsRepository.create(projectData);
        await this.filesService.updateFile(previewFileId, {
            targetId: project.id,
        });

        // return this.enrichProjectWithPreviewUrl(project);//TODO: Tут же надо по идее редачить Content, так как в контенте хранится только fileKey
        return this.resolveFileKeysToUrls(project);
    }

    async findAllTemplates(filters: GetTemplatesDto): Promise<CursorPaginationResult<Project, ProjectCursor>> {
        const result =
            await this.projectsPaginationRepository.findAllTemplatesWithCursor(filters);

        const enrichedProjects = await Promise.all(
            result.items.map((project) =>
                this.enrichProjectWithPreviewUrl(project),
            ),
        );

        return {
            ...result,
            items: enrichedProjects.map((project) =>
                plainToInstance(Project, project, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                }),
            ),
        };
    }

    async findByAuthorId(
        authorId: number,
        filters: GetProjectsCursorDto,
    ): Promise<CursorPaginationResult<Project, ProjectCursor>> {
        const result =
            await this.projectsPaginationRepository.findByAuthorIdWithCursor(authorId, filters);

        const enrichedProjects = await Promise.all(
            result.items.map((project) =>
                this.enrichProjectWithPreviewUrl(project),
            ),
        );

        return {
            ...result,
            items: enrichedProjects.map((project) =>
                plainToInstance(Project, project, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                }),
            ),
        };
    }

    async findById(
        id: number,
        serializationGroup: string[] = SERIALIZATION_GROUPS.DETAILED,
        withUrl: boolean = true,
    ): Promise<Project> {
        const project = await this.projectsRepository.findById(id);

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        if (withUrl) {
            const projectWithUrls = await this.resolveFileKeysToUrls(project);

            return plainToInstance(Project, projectWithUrls, {
                groups: serializationGroup,
            });
        }

        return plainToInstance(Project, project, {
            groups: serializationGroup,
        });
    }

    async findByIdWithFullInformation(id: number, withUrl?: boolean): Promise<Project> {
        return await this.findById(id, SERIALIZATION_GROUPS.FULL, withUrl);
    }

    async findByIdAndAuthor(
        id: number,
        authorId: number,
        withUrl: boolean = true,
    ): Promise<Project> {
        const project = await this.projectsRepository.findByIdAndAuthor(
            id,
            authorId,
        );

        if (!project) {
            throw new NotFoundException(
                `Project with ID ${id} not found or you don't have access to it`,
            );
        }

        if (withUrl) {
            const projectWithUrls = await this.resolveFileKeysToUrls(project);

            return plainToInstance(Project, projectWithUrls, {
                groups: SERIALIZATION_GROUPS.DETAILED,
            });
        }

        return plainToInstance(Project, project, {
            groups: SERIALIZATION_GROUPS.DETAILED,
        });
    }

    async update(
        id: number,
        dto: UpdateProjectDto,
        authorId: number,
    ): Promise<Project> {
        const { previewFileId: oldPreviewFileId } =
            await this.findByIdWithFullInformation(id);
        const oldPreviewFile: PrismaFile =
            await this.filesService.findById(oldPreviewFileId);

        let processedContent = dto.content;
        let updateData: Partial<Project> = { ...dto };

        if (dto.content) {
            const { previewFileId, processedContent: newContent } =
                await this.processProjectContent(dto.content, authorId, id);

            processedContent = newContent;
            updateData = {
                ...dto,
                content: processedContent,
                previewFileId,
            };
        }

        const project: Project = await this.projectsRepository.update(id, updateData);

        if (dto.content && !oldPreviewFile.isDefault)
            await this.filesService.softDelete(oldPreviewFileId);

        return this.enrichProjectWithPreviewUrl(project);
    }

    async delete(id: number): Promise<void> {
        const projectFiles: ProjectFilesResponseDto =
            await this.getProjectFiles(id);

        projectFiles.files.map((file) =>
            this.filesService.softDeleteByFileKey(file.fileKey),
        );

        await this.projectsRepository.delete(id);
    }

    async copy(id: number, authorId: number): Promise<CopyProjectResponseDto> {
        const originalProject = await this.findByIdWithFullInformation(id, false);

        const { newPreviewFileId } = await this.duplicatePreviewFile(
            originalProject.previewFileId,
            authorId,
        );

        const newProjectData: CreateProjectDto = {
            title: `${originalProject.title} (Copy)`,
            description: originalProject.description,
            content: originalProject.content,
            isTemplate: false,
        };

        const copiedProject = await this.projectsRepository.create({
            ...newProjectData,
            previewFileId: newPreviewFileId,
            authorId,
        });

        const { copiedContent } = await this.copyContentAssets(
            originalProject.content,
            authorId,
            copiedProject.id,
        );

        await this.projectsRepository.update(
            copiedProject.id,
            { content: copiedContent }
        );

        await this.filesService.updateFile(newPreviewFileId, {targetId: copiedProject.id});

        return {
            projectId: copiedProject.id,
            message: 'Project copied successfully',
        };
    }

    async getProjectAssetsFiles(id: number): Promise<ProjectFilesResponseDto> {
        await this.findById(id);

        const files: PrismaFile[] =
            await this.filesService.findAllByTargetTypeAndTargetId(
                this.PROJECT_ASSET_TARGET_TYPE,
                id,
            );

        const projectFiles: { fileKey: string; url: string }[] = files.map(
            (file) => ({
                fileKey: file.fileKey,
                url: this.filePathsService.getFileUrl(file),
            }),
        );

        return {
            files: projectFiles,
            total: projectFiles.length,
        };
    }

    async getProjectFiles(id: number): Promise<ProjectFilesResponseDto> {
        await this.findById(id);

        const files: PrismaFile[] =
            await this.filesService.findAllByTargetId(id);

        const projectFiles: { fileKey: string; url: string }[] = files.map(
            (file) => ({
                fileKey: file.fileKey,
                url: this.filePathsService.getFileUrl(file),
            }),
        );

        return {
            files: projectFiles,
            total: projectFiles.length,
        };
    }

    async addFilesToProject(
        id: number,
        files: Express.Multer.File[],
        authorId?: number,
    ): Promise<ProjectFilesResponseDto> {
        await this.findById(id);

        const uploadResults = await this.fileUploadService.uploadMany(files, {
            targetType: this.PROJECT_ASSET_TARGET_TYPE,
            targetId: id,
            authorId,
        });

        return {
            files: uploadResults,
            total: uploadResults.length,
        };
    }

    private async processProjectContent(
        content: any,
        authorId?: number,
        projectId?: number,
    ): Promise<{ previewFileId: number; processedContent: object }> {
        let processedContent = { ...content };
        let previewFileId: number;

        if (content.thumbnailUrl && isBase64Image(content.thumbnailUrl)) {
            const thumbnailFile = await convertBase64ToFile(
                content.thumbnailUrl,
                'thumbnail.png',
            );

            const previewMetadata: UploadFileDto = {
                targetType: this.PROJECT_PREVIEW_TARGET_TYPE,
                targetId: projectId,
                authorId,
            };

            const uploadResult = await this.fileUploadService.upload(
                thumbnailFile,
                previewMetadata,
            );

            previewFileId = uploadResult.fileId;
            processedContent.thumbnailFileId = previewFileId;

            delete processedContent.thumbnailUrl;
        } else if (content.thumbnailFileId) {
            const { newPreviewFileId } = await this.duplicatePreviewFile(
                content.thumbnailFileId,
                authorId!,
                projectId!,
            );
            previewFileId = newPreviewFileId;
        } else {
            throw new BadRequestException('Project thumbnail is required');
        }

        return { previewFileId, processedContent };
    }

    private async copyContentAssets(
        originalContent: any,
        newAuthorId: number,
        newProjectId: number,
    ): Promise<{ copiedContent: any }> {
        let copiedContent = { ...originalContent };

        if (
            originalContent.renderableObjects &&
            Array.isArray(originalContent.renderableObjects)
        ) {
            copiedContent.renderableObjects = await Promise.all(
                originalContent.renderableObjects.map(async (obj: any) => {
                    if (obj.imageSource && isUUID(obj.imageSource)) {
                        const originalFile =
                            await this.filesService.findByFileKey(
                                obj.imageSource,
                            );

                        if (!originalFile.isDefault) {
                            const duplicateFileResult: number =
                                await this.duplicateFile(
                                    originalFile,
                                    originalFile.targetType,
                                    newAuthorId,
                                    newProjectId,
                                );

                            const duplicatedFile: PrismaFile =
                                await this.filesService.findById(
                                    duplicateFileResult,
                                );

                            return {
                                ...obj,
                                imageSource: duplicatedFile.fileKey.toString(),
                            };
                        }
                    }
                    return obj;
                }),
            );
        }

        return { copiedContent };
    }

    private async duplicatePreviewFile(
        originalPreviewFileId: number,
        newAuthorId: number,
        newProjectId?: number,
    ): Promise<{ newPreviewFileId: number }> {
        const originalPreviewFile: PrismaFile =
            await this.filesService.findById(originalPreviewFileId);
        let newPreviewFileId: number = originalPreviewFileId;

        if (!originalPreviewFile.isDefault) {
            newPreviewFileId = await this.duplicateFile(
                originalPreviewFile,
                originalPreviewFile.targetType,
                newAuthorId,
                newProjectId,
            );
        }

        return { newPreviewFileId };
    }

    private async resolveFileKeysToUrls(project: Project): Promise<any> {
        const enrichedProject = await this.enrichProjectWithPreviewUrl(project);

        if (!enrichedProject.content?.renderableObjects) {
            return enrichedProject;
        }

        const resolvedObjects = await Promise.all(
            enrichedProject.content.renderableObjects.map(async (obj: any) => {
                if (obj.imageSource) {
                    //TODO: Разобраться с renderableObjects, ее структурой, как именно мы должны обрабатывать imageSource, есть ли у него какие-то поля
                    const file = await this.filesService.findByFileKey(
                        obj.imageSource,
                    );

                    return {
                        ...obj,
                        imageSource: this.filePathsService.getFileUrl(file),
                    };
                }
                return obj;
            }),
        );

        return {
            ...enrichedProject,
            content: {
                ...enrichedProject.content,
                renderableObjects: resolvedObjects,
            },
        };
    }

    private async enrichProjectWithPreviewUrl(project: any): Promise<any> {
        const previewFile = await this.filesService.findById(
            project.previewFileId,
        );

        if (!previewFile) {
            throw new NotFoundException(
                `Preview file with id ${project.previewFileId} not found`,
            );
        }

        return {
            ...project,
            previewUrl: this.filePathsService.getFileUrl(previewFile),
        };
    }

    async duplicateFile(
        originalDbFile: PrismaFile,
        newTargetType: FileTargetType,
        newAuthorId: number,
        newTargetId?: number,
    ): Promise<number> {
        const filePath = this.filePathsService.getFilePath(originalDbFile);
        const fileBuffer = await fsPromises.readFile(filePath);

        const newOriginalName = `${originalDbFile.fileKey}_copy.${originalDbFile.extension}`;

        const multerFileToUpload: Express.Multer.File = {
            //TODO: Переместить в utils
            buffer: fileBuffer,
            originalname: newOriginalName,
            mimetype: originalDbFile.mimeType,
        } as Express.Multer.File;

        const uploadResult = await this.fileUploadService.upload(
            multerFileToUpload,
            {
                targetType: newTargetType,
                targetId: newTargetId,
                authorId: newAuthorId,
            },
        );

        if (!uploadResult || typeof uploadResult.fileId !== 'number') {
            throw new Error(
                'File duplication failed: could not retrieve new file ID.',
            );
        }

        return uploadResult.fileId;
    }

    private async getDefaultPreviewId(): Promise<number> {
        const previewFile = await this.filesService.findAllDefaultsByTargetType(
            this.PROJECT_PREVIEW_TARGET_TYPE,
        );
        if (!previewFile || previewFile.length === 0) {
            throw new ImATeapotException('Default avatar file not found');
        }
        return previewFile[0].id;
    }

    async removeAssetAndUpdateContent(
        projectId: number,
        fileKeyToRemove: string,
        authorId: number,
    ): Promise<Project> {
        const project = await this.findByIdAndAuthor(
            projectId,
            authorId,
            false,
        );

        const fileToRemove: PrismaFile | null =
            await this.filesService.findByFileKeyAndTargetType(
                fileKeyToRemove,
                this.PROJECT_ASSET_TARGET_TYPE,
                projectId,
            );

        if (!fileToRemove) {
            throw new NotFoundException(
                `Asset with key ${fileKeyToRemove} not found in project ${projectId}.`,
            );
        }

        const defaultAssetKey = this.DEFAULT_ASSET_KEY;

        const defaultAsset =
            await this.filesService.findByFileKey(defaultAssetKey);

        const content = project.content as any;

        if (
            content?.renderableObjects &&
            Array.isArray(content.renderableObjects)
        ) {
            content.renderableObjects = content.renderableObjects.map(
                (obj: any) => {
                    if (
                        obj.type === 'image' &&
                        obj.imageSource === fileKeyToRemove
                    ) {
                        return {
                            ...obj,
                            imageSource: defaultAsset.fileKey,
                        };
                    }
                    return obj;
                },
            );
        }

        const updatedProject = await this.projectsRepository.update(projectId, {
            content: content,
        });

        if (!fileToRemove.isDefault) {
            await this.filesService.softDeleteByFileKey(fileKeyToRemove);
        }

        return this.resolveFileKeysToUrls(updatedProject);
    }
}
